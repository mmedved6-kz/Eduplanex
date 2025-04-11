const Staff = require("../models/staffModel");
const StaffDTO = require("../dto/staffDTO");

const getAllStaff = async (req, res) => {
  try {
    const { 
      page = 1, 
      pageSize = 10, 
      search = '', 
      sortColumn = 'staff.name', 
      sortOrder = 'ASC',
      departmentId = null,
      sex = null
    } = req.query;

    const filters = {
      departmentId: departmentId ? parseInt(departmentId) : null,
      sex: sex || null
    };

    const limit = parseInt(pageSize);
    const offset = (parseInt(page) - 1) * limit;
    
    const staff = await Staff.getAll(limit, offset, search, sortColumn, sortOrder, filters);
    const totalStaff = await Staff.count(search, filters);
    const totalPages = Math.ceil(totalStaff.count / limit);
    
    const staffDTOs = staff.map((staff) => new StaffDTO(staff));
    res.json({
      items: staffDTOs,
      currentPage: parseInt(page),
      totalPages,
      totalItems: totalStaff.count,
      pageSize: limit,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.getById(req.params.id);
    if (staff) {
      const staffDto = new StaffDTO(staff);
      res.json(staffDto);
    } else {
      res.status(404).json({ error: "Staff not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const staffData = {
      id: req.body.id,
      username: req.body.username,
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      phone: req.body.phone,
      sex: req.body.sex,
      img: req.body.img,
      position: req.body.position,
      departmentId: req.body.departmentId,
    };

    const newStaff = await Staff.create(staffData);
    const staffDto = new StaffDTO(newStaff);
    res.status(201).json(staffDto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const staffData = {
      id: req.body.id,
      username: req.body.username,
      name: req.body.name,
      surname: req.body.surname,
      email: req.body.email,
      phone: req.body.phone,
      sex: req.body.sex,
      img: req.body.img,
      position: req.body.position,
      departmentId: req.body.departmentId,
    }
    const updatedStaff = await Staff.update(req.params.id, staffData);
    const staffDto = new StaffDTO(updatedStaff);
    res.json(staffDto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    await Staff.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
};
