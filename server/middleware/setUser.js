
export function setUser(req, res, next) {
    res.locals.user = req.user;
    next();
}
