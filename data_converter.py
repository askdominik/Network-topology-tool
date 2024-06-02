import re

from constants import SYSTEM_CAPABILITIES


class DataConverter:
    @staticmethod
    def convert_hex_to_ascii(hex_str):
        try:
            hex_str = hex_str[2:]
            hex_bytes = bytes.fromhex(hex_str)
            return hex_bytes.decode("ascii")
        except ValueError:
            return hex_str

    @staticmethod
    def convert_hex_to_binary(hex_str):
        hex_value = int(hex_str, 16)
        return format(hex_value, "016b")

    @staticmethod
    def convert_system_capabilities(hex_str):
        binary = DataConverter.convert_hex_to_binary(hex_str)
        return [
            SYSTEM_CAPABILITIES[index]
            for index, value in enumerate(binary)
            if value == "1"
        ]

    @staticmethod
    def check_and_format_mac_address(entry):
        formatted_mac = ":".join(entry[i : i + 2] for i in range(0, 12, 2))
        pattern = r"^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
        if re.match(pattern, formatted_mac):
            return formatted_mac.upper()
        return entry
