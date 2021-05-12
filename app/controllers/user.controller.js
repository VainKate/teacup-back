const userController = {
    update(req, res, next) {
        userService
            .update(req.params.id, req.body)
            .then((user) => res.json(user))
            .catch(next);
    },
};
