import json

import networkx as nx
import yaml

from lldp_processor import LLDPProcessor
from snmp_manager import SNMPManager


class NetworkGraph:
    def __init__(self):
        self.graph = nx.Graph()

    def generate_network_data(self):
        with open("config.yaml", "r") as stream:
            config = yaml.safe_load(stream)

        ip_data = config["ips"]

        lldp_data = {}
        source_lldp_data = {}

        for entry in ip_data:
            ip = entry["ip"]
            community_string = entry["community_string"]

            snmp_manager = SNMPManager(community_string, ip)
            lldp_processor = LLDPProcessor(snmp_manager)

            if ip not in lldp_data.keys():
                lldp_result = lldp_processor.get_lldp_data()
                source_lldp_data[ip] = lldp_result
                for neighbor_ip, neighbor_data in lldp_result.items():
                    snmp_manager = SNMPManager(community_string, neighbor_ip)
                    lldp_processor = LLDPProcessor(snmp_manager)
                    source_lldp_data[neighbor_ip] = lldp_processor.get_lldp_data()
                lldp_data.update(source_lldp_data)

        for source_ip, neighbors in lldp_data.items():
            self.graph.add_node(source_ip, **neighbors.get(source_ip, {}))
            for neighbor_ip, neighbor_data in neighbors.items():
                self.graph.add_node(neighbor_ip, **neighbor_data)
                self.graph.add_edge(source_ip, neighbor_ip)

        return json.dumps(nx.node_link_data(self.graph))
