export const DEVICE_CATEGORIES = [
    {
        id: "smart-phone",
        name: "Smart Phone",
        description:
            "Cracked screens, battery issues, water damage and more.",
        image: "/src/assets/phone.png",
    },
    {
        id: "tablet",
        name: "Tablet",
        description:
            "Fast and reliable tablet repair solutions.",
        image: "/src/assets/tablet.png",
    },
    {
        id: "Android",
        name: "Android ",
        description:
            "We can do complex repair like motherboard replacements.",
        image: "/src/assets/android.png",
    },
    {
        id: "laptop",
        name: "Laptop",
        description:
            "Hardware and software repair solutions.",
        image: "/src/assets/laptop.png",
    },
    {
        id: "iphone",
        name: "iPhone",
        description:
            "Screen, battery and software issues.",
        image: "/src/assets/iphone.png",
    },
];


export const REPAIR_HISTORY = [
    {
        id:"1",
        trackingId:"PR124596",
        deviceName:"Samsung S23 Ultra",
        brandModel:"Samsung S23 Ultra",
        submitted:"July 5, 2026",
        estimatedCompletion:"July 8, 2026",
        issue:"Cracked screen and touch issue",
        initials:"SS"
    },
    {
        id:"2",
        trackingId:"PR124485",
        deviceName:"ASUS Vivobook",
        brandModel:"ASUS Vivobook X157V",
        submitted:"January 23, 2026",
        estimatedCompletion:"January 27,2026",
        issue:"Battery charging problem",
        initials:"AS"
    }
];


export const TRACKING_STEPS=[
    {
        label:"Request Submitted",
        detail:"Request received",
        status:"complete"
    },
    {
        label:"Repairing",
        detail:"Device repairing in progress",
        status:"pending"
    },
    {
        label:"Testing",
        detail:"Quality testing",
        status:"pending"
    },
    {
        label:"Completed",
        detail:"Ready for collection",
        status:"pending"
    }
];


export const REPAIR_UPDATES=[
    {
        id:"1",
        title:"Repair Started",
        description:
        "Technician started working on your device.",
        timeAgo:"2 hours ago",
        date:"July 6, 2026"
    },
    {
        id:"2",
        title:"Device Received",
        description:
        "Device received at repair center.",
        timeAgo:"1 day ago",
        date:"July 5,2026",
        received:true
    }
];