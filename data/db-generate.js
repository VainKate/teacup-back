const { sequelize, Channel, Tag, User } = require('../app/models');
const { Op } = require('sequelize')
const bcrypt = require('bcrypt');
const faker = require('faker')

faker.locale = "fr";
faker.seed(999);

const SALT_ROUNDS = 10;

// Don't forget to create a db first and set DATABASE_URL in your .env before running this file

(async () => {
    try {
        await sequelize.sync({ force: true });

        const createdTags = await Tag.bulkCreate([
            { name: "Cuisine" },
            { name: "Horreur" },
            { name: "Variété française" },
            { name: "Catch" },
            { name: "Planche à voile" },
            { name: "Films" },
            { name: "Comédies Musicales" },
            { name: "Mangas/Animes" },
            { name: "Poterie" },
            { name: "Jeux Vidéos" },
            { name: "Action" },
            { name: "Jeux de cartes" },
            { name: "Jeux de société" },
            { name: "Romantique" },
            { name: "Séries TV" },
            { name: "Mignon" },
            { name: "Épique" },
            { name: "RPG" },
            { name: "Livres" },
            { name: "Stratégie" },
            { name: "Comédie" },
            { name: "Mystère" },
            { name: "Réflexion" },
            { name: "Enquête" },
            { name: "Sport" },
            { name: "Comics" }
        ]);

        const channelMap = [
            {
                title: 'GLOW',
                tags: [{ name: 'Séries TV' }, { name: 'Catch' }, { name: 'Comédie' }]
            },
            {
                title: "The walking dead",
                tags: [{ name: "Séries TV" }, { name: "Horreur" }, { name: "Action" }, { name: "Comics" }]
            },
            {
                title: "Jeux vidéos d'action",
                tags: [{ name: "Jeux Vidéos" }, { name: "Action" }]
            },
            {
                title: "Films d'action",
                tags: [{ name: "Films" }, { name: "Action" }]
            },
            {
                title: "Cats",
                tags: [{ name: "Films" }, { name: "Comédies Musicales" }]
            },
            {
                title: "School Live/Gakkougurashi",
                tags: [{ name: "Mignon" }, { name: "Mangas/Animes" }, { name: "Horreur" }]
            },
            {
                title: "Higurashi no naku koro ni",
                tags: [{ name: "Mignon" }, { name: "Mangas/Animes" }, { name: "Horreur" }, { name: "Mystère" }]
            },
            {
                title: "The Witcher",
                tags: [{ name: "Jeux Vidéos" }, { name: "Séries TV" }, { name: "Épique" }, { name: "Action" }, { name: "RPG" }, { name: "Livres" }]
            },
            {
                title: "Magic",
                tags: [{ name: "Jeux de cartes" }, { name: "Stratégie" }, { name: "Réflexion" }]
            },
            {
                title: "Let's create! Pottery VR",
                tags: [{ name: "Jeux Vidéos" }, { name: "Poterie" }]
            },
            {
                title: 'Danganronpa',
                tags: [{ name: "Jeux Vidéos" }, { name: "Mangas/Animes" }, { name: "Horreur" }, { name: "Enquête" }, { name: "Réflexion" }]
            },
            {
                title: "Crazy Ex-Girlfriend",
                tags: [{ name: "Série TV" }, { name: "Comédies Musicales" }, { name: "Comédie" }, { name: "Romantique" }]
            },
            {
                title: "Dixit",
                tags: [{ name: "Jeux de société" }, { name: "Réflexion" }]
            },
            {
                title: "Fiesta de los Muertos",
                tags: [{ name: "Jeux de société" }, { name: "Réflexion" }]
            },
            {
                title: "Muertigos",
                tags: [{ name: "Jeux de société" }, { name: "Réflexion" }, { name: "Jeux Vidéos" }]
            },
            {
                title: "Portal",
                tags: [{ name: "Réflexion" }, { name: "Jeux Vidéos" }]
            },
            {
                title: "Les pires horreurs en cuisine",
                tags: [{ name: "Cuisine" }, { name: "Horreur" }]
            },
            {
                title: "Le meilleur du catch à coup de planche à voile !",
                tags: [{ name: "Catch" }, { name: "Planche à voile" }, { name: "Sport" }]
            },
            {
                title: "Phoenix Wright/Ace Attorney",
                tags: [{ name: "Jeux Vidéos" }, { name: "Mangas/Animes" }, { name: "Épique" }, { name: "Enquête" }, { name: "Réflexion" }]
            },
        ];

        const defaultChannels = createdTags.map((tag) => { return { title: tag.name, tags: [{ name: tag.name }] }});

        const createdChannels = [];

        for (const { title, tags } of [...channelMap, ...defaultChannels]) {
            const channel = await Channel.create({ title });
            for (const tag of tags) {
                const matchingTag = createdTags.findIndex((createdTag) => createdTag.dataValues.name === tag.name);
                if (matchingTag !== -1) {
                    await channel.addTag(createdTags[matchingTag].dataValues.id);
                }
            }
            await channel.save();
            createdChannels.push(channel);
        }

        /*
        for (let index = 0; index < 35; index++) {
            const newUser = await User.create({
                email: faker.internet.email(),
                password: await bcrypt.hash(faker.internet.password(), SALT_ROUNDS),
                nickname: faker.internet.userName()
            });

            await newUser.reload();

            await newUser.addTag(await Tag.findAll({
                order: sequelize.random(),
                limit: Math.round(Math.random() * (11 - 1) + 1)
            }));

            const userTags = await newUser.getTags();

            await newUser.addChannel(await Channel.findAll({
                include: {
                    association: "tags",
                    through: {
                        attributes: [],
                    },
                    where: {
                        id: userTags.map(({ id }) => id)
                    }
                },
                order: sequelize.random(),
                limit: Math.round(Math.random() * (userTags.length - 3) + 3)
            }));

            const userChannels = await newUser.getChannels()

            await newUser.addChannel(await Channel.findAll({
                include: {
                    association: "tags",
                    through: {
                        attributes: [],
                    },
                    where: {
                        id:
                        {
                            [Op.not]: userTags.map(({ id }) => id)
                        }
                    }
                },
                order: sequelize.random(),
                limit: Math.round(Math.random() * userChannels.length / 3)
            }));
        }
        */
    }

    catch (err) {
        console.error(">> Error while creating: ", err);
    }

    finally {
        sequelize.close();
    }

})()
