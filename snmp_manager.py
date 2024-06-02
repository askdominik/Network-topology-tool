import sys

from pysnmp.carrier.error import CarrierError
from pysnmp.error import PySnmpError
from pysnmp.hlapi import *


class SNMPManager:
    def __init__(self, community, ip):
        self.community = community
        self.ip = ip

    def snmp_get_next(self, oid):
        result_list = []
        try:
            for errorIndication, errorStatus, errorIndex, varBinds in nextCmd(
                SnmpEngine(),
                CommunityData(self.community),
                UdpTransportTarget((self.ip, 161)),
                ContextData(),
                ObjectType(ObjectIdentity(oid)),
                lookupMib=False,
                lexicographicMode=False,
            ):

                if errorIndication:
                    print(errorIndication, file=sys.stderr)
                    return [], str(errorIndication)

                elif errorStatus:
                    print(
                        "%s at %s"
                        % (
                            errorStatus.prettyPrint(),
                            errorIndex and varBinds[int(errorIndex) - 1][0] or "?",
                        ),
                        file=sys.stderr,
                    )
                    return [], str(errorStatus)

                else:
                    for varBind in varBinds:
                        result_list.append(
                            " = ".join([x.prettyPrint() for x in varBind])
                        )
        except (CarrierError, PySnmpError, OSError) as e:
            print(f"Error fetching SNMP data: {e}", file=sys.stderr)
            return [], str(e)

        return result_list, None
