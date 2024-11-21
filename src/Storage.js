function save({ apiKey, model }) {
    window?.localStorage?.setItem("apiKey", apiKey);
    window?.localStorage?.setItem("model", model);
}

function get() {
    return {
        apiKey: window.localStorage.getItem("apiKey") || null,
        model: window.localStorage.getItem("model") || "gpt-3.5-turbo"
    }
}

export default { save, get }