SYSTEM_CAPABILITIES = {
    0: " (LSB): Other",
    1: " Repeater",
    2: " Bridge",
    3: " WLAN Access Point",
    4: " Router",
    5: " Telephone",
    6: " DOCSIS Cable Device",
    7: " Station Only",
}

LLDP_MIB_OIDS = [
    ("TimeMark", "1.0.8802.1.1.2.1.4.1.1.1"),
    ("LocalPortNum", "1.0.8802.1.1.2.1.4.1.1.2"),
    ("Index", "1.0.8802.1.1.2.1.4.1.1.3"),
    ("ChassisIdSubtype", "1.0.8802.1.1.2.1.4.1.1.4"),
    ("ChassisId", "1.0.8802.1.1.2.1.4.1.1.5"),
    ("PortIdSubtype", "1.0.8802.1.1.2.1.4.1.1.6"),
    ("PortId", "1.0.8802.1.1.2.1.4.1.1.7"),
    ("PortDesc", "1.0.8802.1.1.2.1.4.1.1.8"),
    ("SysName", "1.0.8802.1.1.2.1.4.1.1.9"),
    ("SysDesc", "1.0.8802.1.1.2.1.4.1.1.10"),
    ("SysCapSupported", "1.0.8802.1.1.2.1.4.1.1.11"),
    ("SysCapEnabled", "1.0.8802.1.1.2.1.4.1.1.12"),
]

LLDP_REM_ENTRY_OID = "1.0.8802.1.1.2.1.4.1.1"
LLDP_REM_MAN_ADDR_IF_SUBTYPE_OID = "1.0.8802.1.1.2.1.4.2.1.3"
