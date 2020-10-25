const { Op } = require('sequelize');
const db = require('_helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};
async function getAll() {
    const categorys = await db.Category.findAll();
    return categorys.map(x => basicDetails(x));
}

async function getById(id) {
    const category = await getCategory(id);
    return basicDetails(category);
}
async function create(params) {
    // validate
    // if (await db.Category.findOne({ where: { name: params.name } })) {
    //     throw 'Name "' + params.name + '" is already registered';
    // }

    const category = new db.Category(params);

    // save category
    await category.save();

    return basicDetails(category);
}

async function update(id, params) {
    const category = await getCategory(id);

    // validate (if email was changed)
    if (params.name && category.name !== params.name && await db.Category.findOne({ where: { name: params.name } })) {
        throw 'Name "' + params.name + '" is already taken';
    }

    // copy params to category and save
    Object.assign(category, params);
    category.updated = Date.now();
    await category.save();

    return basicDetails(category);
}

async function _delete(id) {
    const category = await getCategory(id);
    await category.destroy();
}

// helper functions

async function getCategory(id) {
    const category = await db.Category.findByPk(id);
    if (!category) throw 'category not found';
    return category;
}

function basicDetails(category) {
    const { id, name,type, position,created, updated, isActive } = category;
    return { id, name,type, position,created, updated, isActive };
}