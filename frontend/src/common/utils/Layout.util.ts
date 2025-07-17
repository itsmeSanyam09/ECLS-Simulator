
export const isCustomUrls = (to: string, url: string) => {
    return isDashboardUrls(to, url) || isStrategiesUrls(to, url);
}

const isDashboardUrls = (to: string, url: string) => {
    //TODO : update
    return to === '/home' && url === '/dashboard'
        ? true
        : false;
}

const isStrategiesUrls = (to: string, url: string) => {
    //TODO : update
    return to === '/strategy' && url.startsWith('/strategies')
        ? true
        : false;
}