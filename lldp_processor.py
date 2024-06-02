import re

from constants import (
    LLDP_MIB_OIDS,
    LLDP_REM_ENTRY_OID,
    LLDP_REM_MAN_ADDR_IF_SUBTYPE_OID,
)
from data_converter import DataConverter


class LLDPProcessor:
    def __init__(self, snmp_manager):
        self.snmp_manager = snmp_manager

    def get_lldp_data(self):
        lldp_data = {}

        lldpRemEntry_data, error = self.snmp_manager.snmp_get_next(LLDP_REM_ENTRY_OID)
        if error or not lldpRemEntry_data:
            lldp_data[self.snmp_manager.ip] = {"status": "down"}
            return lldp_data

        lldpRemManAddrIfSubtype_data, error = self.snmp_manager.snmp_get_next(
            LLDP_REM_MAN_ADDR_IF_SUBTYPE_OID
        )
        if error or not lldpRemManAddrIfSubtype_data:
            lldp_data[self.snmp_manager.ip] = {"status": "down"}
            return lldp_data

        for i in lldpRemEntry_data:
            parts = i.split(" = ")
            oid, data = parts[0], parts[1]
            lldp_mib, identifier = self.get_lldp_mib(oid)

            ip = self.get_ip_by_identifier(
                lldpRemManAddrIfSubtype_data,
                LLDP_REM_MAN_ADDR_IF_SUBTYPE_OID,
                identifier,
            )
            if ip not in lldp_data:
                lldp_data[ip] = {"status": "up"}

            if lldp_mib == "SysCapSupported" or lldp_mib == "SysCapEnabled":
                data = DataConverter.convert_system_capabilities(data)

            if "0x" in data:
                data = DataConverter.convert_hex_to_ascii(data)

            if lldp_mib == "ChassisId" or lldp_mib == "PortId":
                data = DataConverter.check_and_format_mac_address(data)

            lldp_data[ip][lldp_mib] = data
        return lldp_data

    def get_lldp_mib(self, entry):
        for mib, oid in LLDP_MIB_OIDS:
            if oid + "." in entry:
                identifier = entry.replace(oid + ".", "")
                return mib, identifier

    def get_ip_by_identifier(self, data, oid, identifier):
        for i in data:
            if oid + "." + identifier in i:
                return re.findall(r"(\d+\.\d+\.\d+\.\d+) = \d+", i)[0]
