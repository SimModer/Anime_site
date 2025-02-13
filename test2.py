import requests
from bs4 import BeautifulSoup
import sqlite3

# URL of the transport list page
URL = 'https://transphoto.org/list.php?cid=149&t=1'

# Function to get the HTML content of the page
def get_html(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://transphoto.org/'
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()  # Raise an error for bad status codes
    return response.text

# Function to parse the HTML content and extract transport data
def parse_html(html):
    soup = BeautifulSoup(html, 'html.parser')
    transport_data = []

    # Example parsing logic (this will depend on the actual structure of the page)
    # Adjust the selectors according to the actual HTML structure
    table = soup.find('table', {'class': 'ts1'})  # Adjust the class name as needed
    rows = table.find_all('tr')[1:]  # Skip the header row

    for row in rows:
        cols = row.find_all('td')
        if len(cols) > 4:  # Ensure there are enough columns
            transport_data.append({
                'number': cols[0].text.strip(),
                'model': cols[1].text.strip(),
                'year': cols[2].text.strip(),
                'status': cols[3].text.strip()
            })

    return transport_data

# Function to create and populate the SQLite database
def create_database(data):
    conn = sqlite3.connect('transport.db')
    c = conn.cursor()

    # Create table
    c.execute('''
    CREATE TABLE IF NOT EXISTS transport (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        number TEXT,
        model TEXT,
        year TEXT,
        status TEXT
    )
    ''')

    # Insert data
    c.executemany('''
    INSERT INTO transport (number, model, year, status)
    VALUES (:number, :model, :year, :status)
    ''', data)

    conn.commit()
    conn.close()

def main():
    html = get_html(URL)
    transport_data = parse_html(html)
    create_database(transport_data)
    print('Database created and populated successfully.')

if __name__ == '__main__':
    main()