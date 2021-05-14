const { User, Channel, Tag } = require("../models");

const userController = {
    /**
     *
     * @param {json} req.body
     * @param {json} res.json
     * @returns
     */

    update: async (req, res) => {
        const id = req.params.id;
        const {email, nickname, tags} = req.body;

        try {
            const options = tags ? {
                include : {
                    association : "tags",
                    through : {
                        attributes : []
                    }
                }
            } : null

            const user = await User.findByPk(id, options);

            if(!user){
                return res.status(400).send('No user found.')
            };

            await user.update({email, nickname});

            if(tags){
            await user.setTags(tags);
            };
            
            await user.reload()

            res.json(user)

        } catch(error) {
            res.status(500).json({error: error.message});

        }
    },
}

module.exports = userController;
