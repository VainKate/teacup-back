module.exports = (sequelize, DataTypes, Model) => {

    class Tag extends Model { };
    
    Tag.init({
        name: {
            type: DataTypes.TEXT,
            unique: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Tag',
        tableName: 'tag'
    });

    return Tag;
};