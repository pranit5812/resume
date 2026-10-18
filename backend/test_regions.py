import psycopg2

regions = [
    'us-east-1', 'us-west-1', 'us-west-2', 'us-east-2', 
    'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
    'ap-south-1', 'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2',
    'sa-east-1', 'ca-central-1', 'af-south-1', 'me-south-1'
]

success = False
for r in regions:
    try:
        url = f'postgresql://postgres.icabrsjxrqphdmwenkqr:Pranitp5812@aws-0-{r}.pooler.supabase.com:6543/postgres'
        conn = psycopg2.connect(url)
        print('SUCCESS: ' + r)
        conn.close()
        success = True
        break
    except Exception as e:
        if "ENOTFOUND" not in str(e):
            print(f"Error on {r}: {e}")

if not success:
    print('NONE')
