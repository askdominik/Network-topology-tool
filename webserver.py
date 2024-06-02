import time

from flask import Flask, Response, redirect, render_template, url_for

from network_graph import NetworkGraph


class WebServer:
    def __init__(self):
        self.app = Flask(__name__)
        self.network_graph = NetworkGraph()
        self.setup_routes()

    def generate(self):
        while True:
            graph_data = self.network_graph.generate_network_data()
            yield f"data: {graph_data}\n\n"
            time.sleep(5)

    def setup_routes(self):
        @self.app.route("/")
        def root():
            return redirect(url_for('topology'))

        @self.app.route("/topology")
        def topology():
            return render_template("topology.html")

        @self.app.route("/all_devices")
        def all_devices():
            return render_template("all_devices.html")

        @self.app.route("/topology-stream")
        def topology_stream():
            return Response(self.generate(), mimetype="text/event-stream")
        
        @self.app.route("/devices-stream")
        def all_devices_stream():
            return Response(self.generate(), mimetype="text/event-stream")
