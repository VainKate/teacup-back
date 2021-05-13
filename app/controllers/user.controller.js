const { User, Channel, Tag } = require("../models");

const userController = {
    /**
     *
     * @param {json} req.body
     * @param {json} res.json
     * @returns
     */

    update: async (req, res, next) => {
        const id = parseInt(req.params.id);

        try {
            const result = await User.update(req.body, {where: {id}});
            if (result[0] >= 1) {
                res.json(result);
            } else {
                next();
            }
        } catch(error) {
            console.error(error);
            res.status(500).json({error: error.message});
        }
    },
}

module.exports = userController;
