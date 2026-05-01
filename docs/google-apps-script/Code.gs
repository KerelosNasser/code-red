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
  Users: ["id", "first_name", "last_name", "phone", "role", "team_id", "managed_by", "created_at"],
  Teams: ["id", "name", "admin_phone", "created_at"],
  Admins: ["phone", "first_name", "last_name"],
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
      case "getTeams":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(TeamService.getTeams(parameters.adminPhone));
      case "getAdmin":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(AdminService.get(parameters.phone));
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
      case "createTeam":
        return json(TeamService.create(body.payload));
      case "deleteTeam":
        return json(TeamService.remove(body.teamId, body.adminPhone));
      case "upsertAdmin":
        return json(AdminService.upsert(body.payload));
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

const AdminService = {
  get: function(phone) {
    const normalizedPhone = UserService.normalizePhone(phone);
    const admins = SheetUtils.readAll("Admins");
    const admin = admins.find(function(a) {
      return UserService.normalizePhone(a.phone) === normalizedPhone;
    });
    return { success: true, data: admin || null };
  },

  upsert: function(payload) {
    const inputPhone = UserService.normalizePhone(payload.phone);
    const admins = SheetUtils.readAll("Admins");
    const existingIndex = admins.findIndex(function(a) {
      return UserService.normalizePhone(a.phone) === inputPhone;
    });

    const adminData = [
      inputPhone,
      payload.first_name || payload.firstName || "",
      payload.last_name || payload.lastName || ""
    ];

    if (existingIndex !== -1) {
      SheetUtils.updateRow("Admins", existingIndex + 2, adminData);
    } else {
      SheetUtils.appendRow("Admins", adminData);
    }

    return { success: true, data: { phone: inputPhone } };
  }
};

const TeamService = {
  getTeams: function(adminPhone) {
    const adminComp = UserService.getComparisonPhone(adminPhone);
    const teams = SheetUtils.readAll("Teams");
    const managed = teams.filter(function(t) {
      return UserService.getComparisonPhone(t.admin_phone) === adminComp;
    });
    return { success: true, data: managed };
  },

  create: function(payload) {
    const teamId = Utilities.getUuid();
    SheetUtils.appendRow("Teams", [
      teamId,
      payload.name,
      UserService.normalizePhone(payload.adminPhone),
      new Date().toISOString()
    ]);
    return { success: true, data: { teamId: teamId } };
  },

  remove: function(teamId, adminPhone) {
    const teams = SheetUtils.readAll("Teams");
    const index = teams.findIndex(function(t) { return t.id === teamId; });
    
    if (index === -1) throw new Error("Team not found");
    
    const team = teams[index];
    if (UserService.normalizePhone(team.admin_phone) !== UserService.normalizePhone(adminPhone)) {
       throw new Error("Unauthorized to delete this team");
    }

    SheetUtils.deleteRow("Teams", index + 2);
    return { success: true };
  }
};

const UserService = {
  normalizePhone: function(phone) {
    let cleaned = String(phone || "").replace(/\D/g, '');
    
    // Egyptian logic: match frontend lib/registration.ts
    if (cleaned.startsWith("0") && cleaned.length === 11) {
      return "2" + cleaned;
    }
    if (cleaned.startsWith("1") && cleaned.length === 10) {
      return "20" + cleaned;
    }
    return cleaned;
  },

  // Internal helper for comparison only
  getComparisonPhone: function(phone) {
    let cleaned = String(phone || "").replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.slice(-10); // Match last 10 digits (e.g. 1211730727)
    }
    return cleaned;
  },

  checkAccess: function(phone) {
    const inputComp = this.getComparisonPhone(phone);
    const users = SheetUtils.readAll("Users");
    const user = users.find(function(record) {
      return UserService.getComparisonPhone(record.phone) === inputComp;
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
        teamId: user.team_id || user.teamId,
        team_id: user.team_id || user.teamId
      }
    };
  },

  upsert: function(payload) {
    const inputPhone = this.normalizePhone(payload.phone);
    const users = SheetUtils.readAll("Users");
    const inputComp = this.getComparisonPhone(inputPhone);
    
    const existingIndex = users.findIndex(function(u) {
      return UserService.getComparisonPhone(u.phone) === inputComp;
    });

    const userData = [
      payload.id || Utilities.getUuid(),
      payload.first_name || payload.firstName || "",
      payload.last_name || payload.lastName || "",
      inputPhone,
      payload.role || "member",
      payload.team_id || payload.teamId || "",
      payload.managed_by || payload.managedBy || "",
      payload.created_at || payload.createdAt || new Date().toISOString()
    ];

    if (existingIndex !== -1) {
      SheetUtils.updateRow("Users", existingIndex + 2, userData);
    } else {
      SheetUtils.appendRow("Users", userData);
    }

    return { success: true, data: { userId: userData[0] } };
  },

  getManagedUsers: function(adminPhone) {
    const adminComp = this.getComparisonPhone(adminPhone);
    const users = SheetUtils.readAll("Users");
    const managed = users.filter(function(u) {
      return UserService.getComparisonPhone(u.managed_by) === adminComp;
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
