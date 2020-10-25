const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validateRequest = require('_middleware/validate-request');
const authorize = require('_middleware/authorize')
const Role = require('_helpers/role');
const categoryService = require('services/category.service');

router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id', authorize(), updateSchema, update);
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.delete('/:id', authorize(), _delete);

module.exports = router;


function createSchema(req, res, next) {
    const schema = Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        position: Joi.number().required(),
        isActive: Joi.boolean().required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    categoryService.create(req.body)
    .then(category => res.json(category))
    .catch(next);
}

function updateSchema(req, res, next) {
    const schema = {
        name: Joi.string().empty(''),
        type: Joi.string().empty(''),
        postion: Joi.number().equal(0),
        isActive: Joi.boolean().equal(null),
    };
    // only admins can update role
    if (req.user.role === Role.Admin) {
        schema.role = Joi.string().valid(Role.Admin, Role.User).empty('');
    }
    validateRequest(req, next, schema);
}

function update(req, res, next) {
    categoryService.update(req.params.id, req.body)
        .then(category => res.json(category))
        .catch(next);
}

function getAll(req, res, next) {
    categoryService.getAll()
        .then(category => res.json(category))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account
    if (req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    categoryService.getById(req.params.id)
        .then(category => category ? res.json(category) : res.sendStatus(404))
        .catch(next);
}

function _delete(req, res, next) {
    if (req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    categoryService.delete(req.params.id)
        .then(() => res.json({ message: 'Category deleted successfully' }))
        .catch(next);
}