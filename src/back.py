# Importing module
import mysql.connector
import json
#import collections
import jsonify
#import psycopg2
import requests
import pyodbc
from flask import Flask, jsonify, render_template, request
import webbrowser
import time

app = Flask(__name__)

objects_list = []

print("db connection successful");

@app.route('/test')
def index():

    connection = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=StackOverflow2010;Trusted_Connection=yes;')
    print("db connection 1");

    mydb = mysql.connector.connect(
        host="localhost",
        port=3306,
        user="root",
        password="root",
        database="StackOverflow2010"
    )
    cursor = connection.cursor()

    connection.execute("select * from t1;")
    while 1:
        row = cursor.fetchone()
        if not row:
            break
        print(row.version)

    cursor.close()
    connection.close()

    return jsonify(objects_list)


# @app.route('/test1')
@app.route('/search')
def process_json():
    data = json.loads(request.data)
    # print(data)
    print(data['search'])
    r = requests.get('http://localhost:5000/test')
    lst = []
    lst1 = []
    c = 0
    str1 = ''
    for i in r.text:
        # print(i)
        if i == '"':
            c += 1
        if c % 2 != 0:
            str1 += i
        elif c % 2 == 0:
            if str1[1:len(str1)] == 'id':
                lst.append('1')
                # print('1')
            lst.append(str1[1:len(str1)])
            # print(str1[1:len(str1)])
            str1 = ''
    c = lst.count('')
    print(c)
    for i in range(c):
        lst.remove('')
    for i in range(len(lst)):
        if i % 2 != 0:
            print(lst[i])
    return data


if __name__ == '__main__':
    index()
    app.run()