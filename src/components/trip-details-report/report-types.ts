export type Asset = {
    id: string;
    name: string;
}

export type Driver = {
    id: string;
    firstName: string;
    lastName: string;
};

export type Data = {
    date: string;
    start: string;
    stop: string;
    id: string;
    driverName: string;
    startLocation: string;
    endLocation: string;
    locationType: string[];
    distance: number;
    drivingDuration: number;
    stopDuration: number;
    category: string;
    annotation: string;
    customer: string;
};

export type Ticket = {
    driver: string;
    locations: string[];
    duration: number;
    time: string;
    suggestedTime: string;
    distance: number;
    customer: string[];
    type: string[];
    notes: string[];
};
