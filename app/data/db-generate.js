const { sequelize, Channel, Tag, User } = require('../models');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Don't forget to create a db first and set DATABASE_URL in your .env before running this file

(async _ => {
    try {
        await sequelize.sync({ force: true })

        const channel1 = new Channel({ title: 'Les griffes de la nuit' });
        await channel1.save();

        const tag1 = new Tag({ name: 'Film' });
        await tag1.save();
        const updatedTag1 = await tag1.reload()

        const tag2 = new Tag({ name: 'Horreur' })
        await tag2.save();
        const updatedTag2 = await tag2.reload()

        await channel1.addTag(updatedTag1);
        await channel1.addTag(updatedTag2);

        const user1 = new User({
            email: "pouet@gmail.com",
            password: await bcrypt.hash("pAsLeNoMdEmOnChIeN", SALT_ROUNDS),
            nickname: "boloss-du-93"
        });
        await user1.save()
        const updatedUser1 = await user1.reload()

        const user2 = new User({
            email: "bidule@gmail.com",
            password: await bcrypt.hash("tOuJoUrSpAsLeNoMdEmOnChIeN", SALT_ROUNDS),
            nickname: "belgoss-du-67"
        });
        await user2.save()

        await user1.addTag(updatedTag1);
        await user2.addTag(updatedTag2);

        await channel1.addUser(updatedUser1);
    }

    catch (err) {
        console.error(">> Error while creating: ", err);
    }

    finally {
        sequelize.close();
    }

})()
