export const queryURLParams = (url: string) => {
    var urls = url.split("?")[1];
    const urlSearchParams = new URLSearchParams(urls);
    const params = Object.fromEntries(urlSearchParams.entries());
    return params;
};

export const replaceParamVal = (
    url: string,
    paramName: string,
    replaceWith: string
) => {
    var reg = eval("/(" + paramName + "=)([^&]*)/gi");
    var newUrl = url.replace(reg, paramName + "=" + replaceWith);
    return newUrl;
};
