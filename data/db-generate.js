const { sequelize, Channel, Tag, User } = require('../app/models');
const { Op } = require('sequelize')
const bcrypt = require('bcrypt');
const faker = require('faker')

faker.locale = "fr";
faker.seed(999);

const SALT_ROUNDS = 10;

// Don't forget to create a db first and set DATABASE_URL in your .env before running this file

(async _ => {
    try {
        await sequelize.sync({ force: true })

        await Tag.create({ name: "Cuisine" });
        await Tag.create({ name: "Horreur" });
        await Tag.create({ name: "Variété française" });
        await Tag.create({ name: "Catch" });
        await Tag.create({ name: "Planche à voile" });
        await Tag.create({ name: "Films" });
        await Tag.create({ name: "Comédies Musicales" });
        await Tag.create({ name: "Mangas/Animes" });
        await Tag.create({ name: "Poterie" });
        await Tag.create({ name: "Jeux Vidéos" });
        await Tag.create({ name: "Action" });
        await Tag.create({ name: "Jeux de cartes" });
        await Tag.create({ name: "Jeux de société" });
        await Tag.create({ name: "Romantique" });
        await Tag.create({ name: "Séries TV" });
        await Tag.create({ name: "Mignon" });
        await Tag.create({ name: "Épique" });
        await Tag.create({ name: "RPG" });
        await Tag.create({ name: "Livres" });
        await Tag.create({ name: "Stratégie" });
        await Tag.create({ name: "Comédie" });
        await Tag.create({ name: "Mystère" });
        await Tag.create({ name: "Réflexion" });
        await Tag.create({ name: "Enquête" });
        await Tag.create({ name: "Sport" });
        await Tag.create({ name: "Comics" });

        const chan1 = await Channel.create({ title: "GLOW" });
        await chan1.reload();
        await chan1.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Séries TV", "Catch", "Comédie"]
                }
            }
        }));

        const chan2 = await Channel.create({ title: "The walking dead" });
        await chan2.reload();
        await chan2.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Séries TV", "Horreur", "Action", "Comics"]
                }
            }
        }));

        const chan3 = await Channel.create({ title: "Jeux vidéos d'action" });
        await chan3.reload();
        await chan3.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux Vidéos", "Action"]
                }
            }
        }));

        const chan4 = await Channel.create({ title: "Films d'action" });
        await chan4.reload();
        await chan4.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Films", "Action"]
                }
            }
        }));

        const chan5 = await Channel.create({ title: "Cats" });
        await chan5.reload();
        await chan5.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Films", "Comédies Musicales"]
                }
            }
        }));

        const chan6 = await Channel.create({ title: "School Live/Gakkougurashi" });
        await chan6.reload();
        await chan6.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Mignon", "Mangas/Animes", "Horreur"]
                }
            }
        }));

        const chan7 = await Channel.create({ title: "Higurashi no naku koro ni" });
        await chan7.reload();
        await chan7.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Mignon", "Mangas/Animes", "Horreur", "Mystère"]
                }
            }
        }));

        const chan8 = await Channel.create({ title: "The Witcher" });
        await chan8.reload();
        await chan8.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux Vidéos", "Séries TV", "Épique", "Action", "RPG", "Livres"]
                }
            }
        }));

        const chan9 = await Channel.create({ title: "Magic" });
        await chan9.reload();
        await chan9.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux de cartes", "Stratégie", "Réflexion"]
                }
            }
        }));

        const chan10 = await Channel.create({ title: "Let's create! Pottery VR" });
        await chan10.reload();
        await chan10.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux Vidéos", "Poterie"]
                }
            }
        }));

        const chan11 = await Channel.create({ title: "Danganronpa" });
        await chan11.reload();
        await chan11.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux Vidéos", "Mangas/Animes", "Horreur", "Enquête", "Réflexion"]
                }
            }
        }));

        const chan12 = await Channel.create({ title: "Crazy Ex-Girlfriend" });
        await chan12.reload();
        await chan12.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Série TV", "Comédies Musicales", "Comédie", "Romantique"]
                }
            }
        }));

        const chan13 = await Channel.create({ title: "Dixit" });
        await chan13.reload();
        await chan13.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux de société", "Réflexion"]
                }
            }
        }));

        const chan14 = await Channel.create({ title: "Fiesta de los Muertos" });
        await chan14.reload();
        await chan14.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux de société", "Réflexion"]
                }
            }
        }));

        const chan15 = await Channel.create({ title: "Muertigos" });
        await chan15.reload();
        await chan15.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux de société", "Réflexion", "Jeux Vidéos"]
                }
            }
        }));

        const chan16 = await Channel.create({ title: "Portal" });
        await chan16.reload();
        await chan16.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Réflexion", "Jeux Vidéos"]
                }
            }
        }));

        const chan17 = await Channel.create({ title: "Les pires horreurs en cuisine" });
        await chan17.reload();
        await chan17.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Cuisine", "Horreur"]
                }
            }
        }));

        const chan18 = await Channel.create({ title: "Le meilleur du catch à coup de planche à voile !" });
        await chan18.reload();
        await chan18.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Catch", "Planche à voile", "Sport"]
                }
            }
        }));

        const chan19 = await Channel.create({ title: "Phoenix Wright/Ace Attorney" });
        await chan19.reload();
        await chan19.addTag(await Tag.findAll({
            where: {
                name: {
                    [Op.or]: ["Jeux Vidéos", "Mangas/Animes", "Épique", "Enquête", "Réflexion"]
                }
            }
        }));


        for (const tag of await Tag.findAll()) {
            const newChannel = await Channel.create({ title: tag.name });
            await newChannel.reload();

            await newChannel.addTag(tag);
        }

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
                limit: Math.round(Math.random() * userChannels.length/3)
            }));
        }

    }

    catch (err) {
        console.error(">> Error while creating: ", err);
    }

    finally {
        sequelize.close();
    }

})()
