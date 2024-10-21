const asynchandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            console.log(err)
            next(err)
        })
    }
}
export { asynchandler }