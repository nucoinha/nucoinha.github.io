import requests

from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

import pandas as pd
from datetime import timedelta, datetime
import os
import sys
import subprocess

retry_strategy = Retry(
    total=None,
    status_forcelist=tuple(range(401, 600)),
    method_whitelist=["GET"],
    backoff_factor=1
)
adapter = HTTPAdapter(max_retries=retry_strategy)
http = requests.Session()
http.mount("https://", adapter)
http.mount("http://", adapter)

GITHUB_FOLDER = '56c6565767600102bc80df7ae0c9bda7'
DAILY_FILE = f'{GITHUB_FOLDER}/daily.csv'
NEW_FILE = lambda today: f'{GITHUB_FOLDER}/data_{today}.csv'

get_folder  = lambda s: s.split('/')[0]
get_file    = lambda s: s.split('/')[-1]
json_date = lambda s: pd.to_datetime(datetime.strptime(s, '%Y-%m-%dT%H:%M:%S.%fZ'))
date_only = lambda s: pd.to_datetime(datetime.strptime(s, '%Y-%m-%d'))
date_time = lambda s: pd.to_datetime(datetime.strptime(s, '%Y-%m-%d %H:%M:%S.%f'))

class apis:
    sponsors       = "https://explorer.nucoin.com.br/files/blockchain/sponsors.json"
    blockchain     = "https://explorer.nucoin.com.br/files/blockchain/blockchain.json"
    price_daily    = "https://explorer.nucoin.com.br/files/blockchain/price_history.json"
    price_minute   = "https://api.nucoin.davimoura.dev/chart?period=HOURLY"
    transactions   = "https://explorer.nucoin.com.br/files/blockchain/transaction_history.json"
    wallets_number = "https://explorer.nucoin.com.br/files/blockchain/wallet_history.json"

# Fields of interest
columns = ['min', 'max', 'avg', 'totalLiquidity', 'brlBalance', 'ncnBalance']
extract = lambda infos, columns: (infos[key] for key in columns)

# Should apply to 
get_total_frozen = lambda data: sum(float(sponsor['totalFrozen']) for sponsor in data['sponsors'])
get_circulation  = lambda data: float(data['circulationSupply'])
get_prices_daily = lambda data: [
    [date_only(date), *extract(infos,columns)] # Guarantees order 
    for date, infos in data['prices'].items()
]
get_last_update  = lambda data: json_date(data['lastUpdate'])
get_transactions = lambda data: [
    [date_only(date), number]
    for date, number in data['transactions'].items()
]
get_wallets = lambda data: [
    [date_only(date), number]
    for date, number in data['wallets'].items()
]

def interpolate_data(df):
    """
    must be called before any calculation
    """
    try:
        df.index = pd.to_datetime(df.index)
        df.index = df.index.map(lambda x: x.replace(second=0, microsecond=0))
        min_date = df.index.min()
        max_date = df.index.max()
        date_index = pd.date_range(start=min_date, end=max_date, freq='15T')
        df = df.reindex(date_index)
        df = df.interpolate(method='time')
        df.index.rename('datetime', inplace=True)
    except Exception as e:
        print(type(e).__name__ + str(e))
    return df

def calculate_volume_open_and_close(df):
    fee_tax = 0.30 / 100
    df['close'] = (df['brlBalance'] / df['ncnBalance'])
    df['open']  = df['close'].shift(+1)
    K = df['brlBalance'] * df['ncnBalance']
    df['volume'] = (df['brlBalance'] - K.shift(+1) / df['ncnBalance']) / fee_tax
    # Round the crypto prices to 8 decimal places
    for column in ['open', 'close', 'volume', 'max', 'min', 'avg']:
        df[column] = df[column].apply(lambda x: round(x,8))
    return df

def write_and_send(df, filename):
    print(f'Writing information to {filename}')
    df.to_csv(filename)
    directory = get_folder(filename)
    message = 'auto update'
    try:
        # Change directory to the specified directory
        os.chdir(directory)
        # Check differences
        #subprocess.run(["git", "--no-pager", "diff"], check=True)
        # Add changes to the staging area
        subprocess.run(["git", "add", "."], check=True)
        # Commit changes with the provided message
        #subprocess.run(['git', 'commit', '--amend', '-C', 'HEAD'], check=False)
        subprocess.run(['git', 'commit', '-m', message], check=False)
        # Push changes to the remote repository
        subprocess.run(['git', 'push', '--force'], check=False)
        # Go back to the origin directory
        os.chdir('..')
        print(f"Changes in {directory} added, committed, and pushed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        sys.exit(1)

def job(today, interpolate=False):
    filename = NEW_FILE(today)

    # Fetch Daily Source
    r = http.get(apis.price_daily)
    data = r.json()
    prices = get_prices_daily(data)
    prices_df = pd.DataFrame(prices, columns=['date'] + columns)
    prices_df.set_index('date', inplace=True)

    # Find last data from daily
    last_update = get_last_update(data)
    last_index = str(last_update.date())
    last_entry = prices_df.loc[last_index]
    last_entry['datetime'] = last_update

    # Fetch from sponsors to find the total frozen
    r = http.get(apis.sponsors)
    data = r.json()
    frozen = get_total_frozen(data)
    last_update = get_last_update(data)
    last_entry['totalFrozen'] = frozen 

    r = http.get(apis.blockchain)
    data = r.json()
    supply = get_circulation(data)
    last_update = get_last_update(data)
    last_entry['circulationSupply'] = supply 

    df = pd.DataFrame()
    df = df._append(last_entry)
    df.set_index('datetime', inplace=True)

    try:
        existing_df = pd.read_csv(filename, index_col='datetime', parse_dates=True)
        df = df.combine_first(existing_df)
    except FileNotFoundError:
        pass

    df = calculate_volume_open_and_close(df)
    write_and_send(df, filename)
    todays_df = df

    # # # # # # # # # # # # # # # # # # # # # # # # # #
    # # # # # # # # D A I L Y . C S V # # # # # # # # #
    # # # # # # # # # # # # # # # # # # # # # # # # # #

    r = http.get(apis.transactions)
    data = r.json()
    transactions = get_transactions(data)
    transactions_df = pd.DataFrame(transactions, columns=['date', 'transactions'])
    transactions_df.set_index('date',inplace=True)

    r = http.get(apis.wallets_number)
    data = r.json()
    wallets = get_wallets(data)
    wallets_df = pd.DataFrame(wallets, columns=['date', 'wallets'])
    wallets_df.set_index('date',inplace=True)

    daily_df = pd.merge(prices_df, transactions_df, on='date')
    daily_df = pd.merge(daily_df,  wallets_df,      on='date')

    try:
        existing_df = pd.read_csv(DAILY_FILE, index_col='date', parse_dates=True)
        daily_df = daily_df.combine_first(existing_df)
    except FileNotFoundError:
        pass

    print(todays_df)
    print(daily_df)
    df = daily_df

    last_idx = daily_df.index[-1]
    last_date = last_idx.date()
    todays_open = todays_df.index[0]
    todays_last = todays_df.index[-1]

    new_info = {}
    new_info['open']           = todays_df.at[todays_open,'close']
    new_info['close']          = todays_df.at[todays_last,'close']
    new_info['min']            = todays_df['close'].min()
    new_info['max']            = todays_df['close'].max()
    new_info['avg']            = todays_df['avg'].max()
    new_info['volume']         = todays_df['volume'].sum()
    new_info['brlBalance']     = todays_df.at[todays_last,'brlBalance']
    new_info['ncnBalance']     = todays_df.at[todays_last,'ncnBalance']
    new_info['totalLiquidity'] = todays_df.at[todays_last, 'totalLiquidity']
    new_info['totalFrozen']    = todays_df.at[todays_last, 'totalFrozen']
    
    if today != last_date:
        print("daily.csv missing today's info: appending...")
        df.loc[last_idx + timedelta(days=1)] = new_info
    else:
        print('daily.csv updating last row info')
        df.loc[last_idx] = new_info

    df = calculate_volume_open_and_close(df)
    write_and_send(df, DAILY_FILE)

if __name__ == '__main__':

    import time

    # Server updates each 15min:
    # XX:12:YY.ZZZZZZ
    # XX:27:YY.ZZZZZZ
    # XX:42:YY:ZZZZZZ
    # XX:57:YY:ZZZZZZ
    # Daily information closes at 21h
    first_call = True

    while 1:
        now = datetime.now()
        now_min = now.minute
        now_day = now.day
        now_hour = now.hour
        if now_min in [12, 27, 42, 57] or first_call:
            if not first_call: time.sleep(20) # 20 seconds
            print(f'Calling job for {NEW_FILE(now.date())}` {now}')
            job(now.date())
            first_call = False
        time.sleep(60) # 60 seconds
