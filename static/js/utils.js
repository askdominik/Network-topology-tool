function selectImage(deviceType) {
    var imageBase64 = {
    "router": "static/images/router.png",
    "switch": "static/images/switch.png",
    "other": "static/images/other.png",
    "unknown": "static/images/unknown.png"
    };
    return imageBase64[deviceType];
}

function identifyDeviceType(sysDesc) {
    if (!sysDesc) {
        return "unknown"; 
    }
    var deviceTypes = {
        "router": ["router"],
        "switch": ["C2960", "switch"],
        "other": ["Darwin", "Windows", "Linux"],
    };

    for (var type in deviceTypes) {
        if (deviceTypes[type].some(keyword => sysDesc.includes(keyword))) {
            return type;
        }
    }

    return "unknown";
}