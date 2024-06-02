from webserver import WebServer

if __name__ == "__main__":
    web_server = WebServer()
    web_server.app.run(debug=True)
