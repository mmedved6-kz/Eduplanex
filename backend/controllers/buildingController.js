const Building = require('../models/buildingModel');
const BuildingDto = require('../dto/buildingDto');

// Get all buildings
const getAllBuildings = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 10,
            search = '', 
            sortColumn = 'building.name', 
            sortOrder = 'ASC',
        } = req.query;

        const filters = {

          };
      
        const limit = parseInt(pageSize);
        const offset = (parseInt(page) - 1) * limit;

        const buildings = await Building.getAll(limit, offset, search, sortColumn, sortOrder, filters);
        const totalBuildings = await Building.count(search, filters);
        const totalPages = Math.ceil(totalBuildings.count / limit);
        
        const buildingDtos = buildings.map(building => new BuildingDto(building));
        res.json({
            items: buildingDtos,
            currentPage: parseInt(page),
            totalPages,
            totalItems: totalBuildings.count,
            pageSize: limit,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get an building by ID
const getBuildingById = async (req, res) => {
    try {
        const building = await Building.getById(req.params.id);
        if (event) {
            const buildingDto = new EventDto(building);
            res.json(buildingDto);
        } else {
            res.status(404).json({ error: 'Event not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a new building
const createBuilding = async (req, res) => {
    try {
        const newBuilding = await Building.create(req.body);
        const buildingDto = new BuildingDto(newBuilding);
        res.status(201).json(buildingDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an building
const updateBuilding = async (req, res) => {
    try {
        const updatedBuilding = await Building.update(req.params.id, req.body);
        const buildingDto = new BuildingDto(updatedBuilding);
        res.json(buildingDto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an building
const deleteBuilding = async (req, res) => {
    try {
        await Building.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding,
};