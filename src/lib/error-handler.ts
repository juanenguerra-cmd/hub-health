// centralized error handling

class ErrorHandler {
    static handle(error) {
        console.error('An error occurred:', error);
        // You can add more complex handling logic here, e.g., sending errors to a logging service
    }
}

export default ErrorHandler;
