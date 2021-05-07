const { sequelize, Channel, Tag, User } = require('../app/models');
const bcrypt = require('bcrypt');
const faker = require('faker')

faker.locale = "fr";
faker.seed(999);

const SALT_ROUNDS = 10;

// Don't forget to create a db first and set DATABASE_URL in your .env before running this file

(async _ => {
    try {
        await sequelize.sync({ force: true })

        await new Tag({ name: "Cuisine" }).save();
        await new Tag({ name: "Horreur" }).save();
        await new Tag({ name: "Variété française" }).save();
        await new Tag({ name: "Catch" }).save();
        await new Tag({ name: "Planche à voile" }).save();
        await new Tag({ name: "Film" }).save();
        await new Tag({ name: "Comédie musicales" }).save();
        await new Tag({ name: "Mangas/Animes" }).save();
        await new Tag({ name: "Poterie" }).save();
        await new Tag({ name: "Jeux Vidéos" }).save();
        await new Tag({ name: "Action" }).save();
        await new Tag({ name: "Jeux de société" }).save();
        await new Tag({ name: "Romantique" }).save();
        await new Tag({ name: "Séries TV" }).save();

        for (let index = 0; index < 35; index++) {
            const newUser = await new User({
                email: faker.internet.email(),
                password: await bcrypt.hash(faker.internet.password(), SALT_ROUNDS),
                nickname: faker.internet.userName()
            }).save()

            await newUser.reload()

            await newUser.addTag(await Tag.findAll({
                order: sequelize.random(),
                limit: Math.round(Math.random() * (11 - 1) +1 )
            }))
        }

        for (const tag of await Tag.findAll()) {
            const newChannel = await new Channel({ title: tag.name }).save()
            newChannel.reload()

            await newChannel.addTag(tag);
        }

        const channel1 = await new Channel({ title: 'Les griffes de la nuit' }).save();

        // const tag1 = new Tag({ name: 'Film' });
        // await tag1.save();
        // const updatedTag1 = await tag1.reload()

        // const tag2 = new Tag({ name: 'Horreur' })
        // await tag2.save();
        // const updatedTag2 = await tag2.reload()

        // await channel1.addTag(updatedTag1);
        // await channel1.addTag(updatedTag2);

        // const user2 = new User({
        //     email: "bidule@gmail.com",
        //     password: await bcrypt.hash("tOuJoUrSpAsLeNoMdEmOnChIeN", SALT_ROUNDS),
        //     nickname: "belgoss-du-67"
        // });
        // await user2.save()

        // await user1.addTag(updatedTag1);
        // await user2.addTag(updatedTag2);

        // await channel1.addUser(updatedUser1);
    }

    catch (err) {
        console.error(">> Error while creating: ", err);
    }

    finally {
        sequelize.close();
    }

})()
