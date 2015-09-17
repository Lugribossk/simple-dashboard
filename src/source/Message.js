import Source from "./Source";

export default class Message extends Source {
    constructor(data) {
        super(data);
        this.status = data.status || "success";
        this.message = data.message;
    }

    getStatus() {
        return Promise.resolve({
            title: this.title,
            status: this.status,
            messages: [{
                message: this.message
            }]
        });
    }
}

Message.type = "message";