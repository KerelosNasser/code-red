/**
 * DaRA (Didaskalia Advanced Robotics Association)
 * Google Apps Script Backend API
 *
 * Deployment:
 * - Deploy as Web App
 * - Execute as: Me
 * - Access: Anyone
 */

const CONFIG = {
  SECRET: "DARA-ELKEDESEEN",
  CACHE_TTL: 600,
  SHEET_ID: "1pqNurCRK4T9G7XoJGk--xiQSg9vWL-dcXjTKeckCVf8"
};

const SHEET_SCHEMAS = {
  Users: ["id", "first_name", "last_name", "phone", "role", "team_name", "managed_by", "created_at"],
  Submissions: ["id", "user_id", "type", "payload", "status", "created_at"],
  Products: ["id", "title", "description", "price", "image_url"]
};

// Roles: 'admin', 'servant', 'member'

function doGet(e) {
  const parameters = getRequestParameters(e);
  const action = parameters.action;

  try {
    ensureDatabaseSchema();

    switch (action) {
      case "getCourses":
        // Courses are publicly available as requested
        return json(CourseService.getAllWithLessons());
      case "getProducts":
        return json(ProductService.getAll());
      case "checkUser":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(UserService.checkAccess(parameters.phone));
      case "getUserAssets":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(UserService.getUserAssets(parameters.phone));
      case "getManagedUsers":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(UserService.getManagedUsers(parameters.adminPhone));
      case "setupDatabase":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(setupDatabaseSchema());
      default:
        return json({ success: false, error: "Invalid action" });
    }
  } catch (error) {
    return json({ success: false, error: error.message });
  }
}

function doPost(e) {
  try {
    const body = getPostBody(e);

    if (body.token !== CONFIG.SECRET) {
      return json({ success: false, error: "Unauthorized" });
    }

    ensureDatabaseSchema();

    switch (body.action) {
      case "upsertUser":
        return json(UserService.upsert(body.payload));
      case "deleteUser":
        return json(UserService.remove(body.userId, body.adminPhone));
      case "submitPurchase":
        return json(SubmissionService.handlePurchase(body.payload));
      default:
        return json({ success: false, error: "Invalid action" });
    }
  } catch (error) {
    return json({ success: false, error: error.message });
  }
}

function getRequestParameters(e) {
  return e && e.parameter ? e.parameter : {};
}

function getPostBody(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error("Missing POST body");
  }

  return JSON.parse(e.postData.contents);
}

function getSpreadsheet() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) return activeSpreadsheet;

  if (!CONFIG.SHEET_ID) {
    throw new Error(
      "Spreadsheet is not configured. Set CONFIG.SHEET_ID to your Google Sheet ID."
    );
  }

  return SpreadsheetApp.openById(CONFIG.SHEET_ID);
}

function setupDatabaseSchema() {
  const spreadsheet = getSpreadsheet();
  const created = [];
  const updated = [];

  Object.keys(SHEET_SCHEMAS).forEach(function(sheetName) {
    const headers = SHEET_SCHEMAS[sheetName];
    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      created.push(sheetName);
    } else {
      updated.push(sheetName);
    }

    const requiredColumns = headers.length;
    const currentColumns = sheet.getMaxColumns();

    if (currentColumns < requiredColumns) {
      sheet.insertColumnsAfter(currentColumns, requiredColumns - currentColumns);
    } else if (currentColumns > requiredColumns) {
      sheet.deleteColumns(requiredColumns + 1, currentColumns - requiredColumns);
    }

    sheet.getRange(1, 1, 1, requiredColumns).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, requiredColumns);
  });

  return { success: true, data: { created: created, updated: updated } };
}

function ensureDatabaseSchema() {
  // Only setup if needed, but for simplicity in this script we'll skip the check
  // and assume it's set up or run manually via setupDatabase action.
}

const CourseService = {
  getAllWithLessons: function() {
    // In a real scenario, these would be in sheets. 
    // For this migration, we'll keep the structure but expect the user to populate the sheets.
    const courses = SheetUtils.readAll("Courses");
    return { success: true, data: courses };
  }
};

const ProductService = {
  getAll: function() {
    return { success: true, data: SheetUtils.readAll("Products") };
  }
};

const UserService = {
  normalizePhone: function(phone) {
    return String(phone || "").replace(/\D/g, '').replace(/^0+/, '');
  },

  checkAccess: function(phone) {
    const inputPhone = this.normalizePhone(phone);
    const users = SheetUtils.readAll("Users");
    const user = users.find(function(record) {
      return UserService.normalizePhone(record.phone) === inputPhone;
    });

    if (!user) {
      return { success: true, data: { hasAccess: false } };
    }

    return {
      success: true,
      data: {
        hasAccess: true,
        user: user,
        role: user.role,
        teamName: user.team_name
      }
    };
  },

  upsert: function(payload) {
    const inputPhone = this.normalizePhone(payload.phone);
    const users = SheetUtils.readAll("Users");
    const existingIndex = users.findIndex(function(u) {
      return UserService.normalizePhone(u.phone) === inputPhone;
    });

    const userData = [
      payload.id || Utilities.getUuid(),
      payload.firstName || "",
      payload.lastName || "",
      inputPhone,
      payload.role || "member",
      payload.teamName || "",
      payload.managedBy || "",
      payload.createdAt || new Date().toISOString()
    ];

    if (existingIndex !== -1) {
      SheetUtils.updateRow("Users", existingIndex + 2, userData);
    } else {
      SheetUtils.appendRow("Users", userData);
    }

    return { success: true, data: { userId: userData[0] } };
  },

  remove: function(userId, adminPhone) {
    const users = SheetUtils.readAll("Users");
    const index = users.findIndex(function(u) { return u.id === userId; });
    
    if (index === -1) throw new Error("User not found");
    
    const user = users[index];
    if (user.managed_by !== this.normalizePhone(adminPhone)) {
       throw new Error("Unauthorized to delete this user");
    }

    SheetUtils.deleteRow("Users", index + 2);
    return { success: true };
  },

  getManagedUsers: function(adminPhone) {
    const normalizedAdmin = this.normalizePhone(adminPhone);
    const users = SheetUtils.readAll("Users");
    const managed = users.filter(function(u) {
      return u.managed_by === normalizedAdmin;
    });

    return { success: true, data: managed };
  },

  getUserAssets: function(phone) {
    const inputPhone = this.normalizePhone(phone);
    const users = SheetUtils.readAll("Users");
    const user = users.find(function(u) { return UserService.normalizePhone(u.phone) === inputPhone; });

    if (!user) return { success: true, data: [] };

    // Assets are shared by everyone managed by the same admin
    // Or if the user IS the admin, they see their own purchases
    const ownerPhone = user.role === 'admin' ? inputPhone : user.managed_by;
    
    const submissions = SheetUtils.readAll("Submissions");
    const purchases = submissions.filter(function(s) {
      return s.type === "purchase" && s.status === "completed";
    });

    const productIds = [];
    purchases.forEach(function(p) {
      try {
        const payload = JSON.parse(p.payload);
        if (this.normalizePhone(payload.adminPhone) === ownerPhone) {
           if (payload.productIds) {
             payload.productIds.forEach(function(id) {
               if (productIds.indexOf(String(id)) === -1) productIds.push(String(id));
             });
           }
        }
      } catch (e) {}
    }.bind(this));

    const allProducts = SheetUtils.readAll("Products");
    const userProducts = allProducts.filter(function(p) {
      return productIds.indexOf(String(p.id)) !== -1;
    });

    return { success: true, data: userProducts };
  }
};

const SubmissionService = {
  handlePurchase: function(payload) {
    const submissionId = Utilities.getUuid();
    SheetUtils.appendRow("Submissions", [
      submissionId,
      payload.adminPhone,
      "purchase",
      JSON.stringify(payload),
      "completed",
      new Date().toISOString()
    ]);
    return { success: true, data: { submissionId: submissionId } };
  }
};

const SheetUtils = {
  getSheet: function(sheetName) {
    const spreadsheet = getSpreadsheet();
    let sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) {
       sheet = spreadsheet.insertSheet(sheetName);
       if (SHEET_SCHEMAS[sheetName]) {
         sheet.getRange(1, 1, 1, SHEET_SCHEMAS[sheetName].length).setValues([SHEET_SCHEMAS[sheetName]]);
       }
    }
    return sheet;
  },

  readAll: function(sheetName) {
    const sheet = this.getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();

    if (lastRow < 2 || lastColumn === 0) return [];

    const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
    const headers = values.shift();

    return values
      .filter(function(row) {
        return row.some(function(value) { return value !== ""; });
      })
      .map(function(row) {
        const record = {};
        headers.forEach(function(header, index) {
          record[header] = row[index];
        });
        return record;
      });
  },

  appendRow: function(sheetName, row) {
    this.getSheet(sheetName).appendRow(row);
  },

  updateRow: function(sheetName, rowIndex, row) {
    const sheet = this.getSheet(sheetName);
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  },

  deleteRow: function(sheetName, rowIndex) {
    this.getSheet(sheetName).deleteRow(rowIndex);
  }
};

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
