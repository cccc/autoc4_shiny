export function mqtt_match_topic(subscription, topic) {
    let subscription_levels = subscription.split("/");
    let topic_levels = topic.split("/");
    for (let i = 0; i < subscription_levels.length; i++) {
        let sub_level = subscription_levels[i];
        if (sub_level === "#")
            return true;
        if (sub_level !== topic_levels[i] && sub_level !== "+") {
            return false;
        }
    }
    return subscription_levels.length === topic_levels.length;
}
export function two_digits(i) {
    return ("0" + i).slice(-2);
}
export function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
export function simpleDateFormat(template, date) {
    return template
        .replace(/yyyy/, date.getFullYear().toString())
        .replace(/yy/, (date.getFullYear() % 100).toString())
        .replace(/MM/, two_digits(date.getMonth() + 1))
        .replace(/M/, (date.getMonth() + 1).toString())
        .replace(/dd/, two_digits(date.getDate()))
        .replace(/d/, date.getDate().toString())
        .replace(/HH/, two_digits(date.getHours()))
        .replace(/H/, date.getHours().toString())
        .replace(/mm/, two_digits(date.getMinutes()))
        .replace(/m/, date.getMinutes().toString())
        .replace(/ss/, two_digits(date.getSeconds()))
        .replace(/s/, date.getSeconds().toString());
}

//# sourceMappingURL=utils.js.map
