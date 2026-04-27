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
  Users: ["id", "name", "email", "phone", "role", "created_at"],
  Submissions: ["id", "user_id", "type", "payload", "status", "created_at"],
  Members: ["id", "submission_id", "name", "dob", "phone"],
  Courses: ["id", "title", "description"],
  Lessons: ["id", "course_id", "title", "drive_file_id", "order"],
  Products: ["id", "title", "description", "price", "image_url"]
};

function doGet(e) {
  const parameters = getRequestParameters(e);
  const action = parameters.action;

  try {
    ensureDatabaseSchema();

    switch (action) {
      case "getCourses":
        return json(CourseService.getAllWithLessons());
      case "getProducts":
        return json(ProductService.getAll());
      case "getLessons":
        return json(LessonService.getByCourse(parameters.course_id));
      case "checkUser":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(UserService.checkAccess(parameters.email, parameters.phone));
      case "setupDatabase":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(setupDatabaseSchema());
      case "clearCache":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        CacheService.getScriptCache().removeAll(["courses", "products"]);
        return json({ success: true, data: { message: "Cache cleared" } });
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
      case "submitForm":
        return json(SubmissionService.handle(body.payload));
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
  return setupDatabaseSchema();
}

const CourseService = {
  getAllWithLessons: function() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get("courses");
    if (cached) return JSON.parse(cached);

    const courses = SheetUtils.readAll("Courses");
    const lessons = SheetUtils.readAll("Lessons");

    const lessonMap = lessons.reduce(function(acc, lesson) {
      if (!acc[lesson.course_id]) acc[lesson.course_id] = [];
      acc[lesson.course_id].push({
        ...lesson,
        url: "https://drive.google.com/uc?id=" + lesson.drive_file_id,
        preview_url: "https://drive.google.com/file/d/" + lesson.drive_file_id + "/view"
      });
      return acc;
    }, {});

    const data = courses.map(function(course) {
      return {
        ...course,
        lessons: (lessonMap[course.id] || []).sort(function(a, b) {
          return Number(a.order || 0) - Number(b.order || 0);
        })
      };
    });

    const response = { success: true, data: data };
    cache.put("courses", JSON.stringify(response), CONFIG.CACHE_TTL);
    return response;
  }
};

const ProductService = {
  getAll: function() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get("products");
    if (cached) return JSON.parse(cached);

    const response = { success: true, data: SheetUtils.readAll("Products") };
    cache.put("products", JSON.stringify(response), CONFIG.CACHE_TTL);
    return response;
  }
};

const SubmissionService = {
  handle: function(payload) {
    if (!payload) {
      throw new Error("Missing payload");
    }

    const submissionId = Utilities.getUuid();
    const createdAt = new Date().toISOString();
    const userId = UserService.getOrCreate(payload.email, payload.name, payload.phone);

    SheetUtils.appendRow("Submissions", [
      submissionId,
      userId,
      payload.type || "team_registration",
      JSON.stringify(payload),
      "pending",
      createdAt
    ]);

    try {
      const members = Array.isArray(payload.members) ? payload.members : [];
      const memberRows = members.map(function(member) {
        return [
          Utilities.getUuid(),
          submissionId,
          member.name || "",
          member.dob || member.DOB || "",
          member.phone || member.PhoneNumber || ""
        ];
      });

      SheetUtils.appendRows("Members", memberRows);
      SheetUtils.updateStatus("Submissions", submissionId, "completed");
    } catch (error) {
      SheetUtils.updateStatus("Submissions", submissionId, "partial_failure");
      throw error;
    }

    return { success: true, data: { submissionId: submissionId } };
  }
};

const UserService = {
  getOrCreate: function(email, name, phone) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const users = SheetUtils.readAll("Users");
    const existing = users.find(function(user) {
      return String(user.email || "").trim().toLowerCase() === normalizedEmail;
    });

    if (existing) return existing.id;

    const userId = Utilities.getUuid();
    SheetUtils.appendRow("Users", [
      userId,
      name || "",
      normalizedEmail,
      phone || "",
      "servant",
      new Date().toISOString()
    ]);
    return userId;
  },

  checkAccess: function(email, phone) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").trim();
    const users = SheetUtils.readAll("Users");
    const user = users.find(function(record) {
      const emailMatches =
        String(record.email || "").trim().toLowerCase() === normalizedEmail;
      const phoneMatches = String(record.phone || "").trim() === normalizedPhone;
      return emailMatches && phoneMatches;
    });

    if (!user) {
      return { success: true, data: { hasAccess: false } };
    }

    const submissions = SheetUtils.readAll("Submissions");
    const latestSubmission = submissions
      .filter(function(submission) {
        return (
          submission.user_id === user.id &&
          String(submission.status || "").toLowerCase() === "completed"
        );
      })
      .sort(function(a, b) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })[0];

    return {
      success: true,
      data: {
        hasAccess: Boolean(latestSubmission),
        user: user,
        submission: latestSubmission || null
      }
    };
  }
};

const LessonService = {
  getByCourse: function(courseId) {
    const lessons = SheetUtils.readAll("Lessons");
    const data = lessons
      .filter(function(lesson) {
        return lesson.course_id === courseId;
      })
      .sort(function(a, b) {
        return Number(a.order || 0) - Number(b.order || 0);
      });

    return { success: true, data: data };
  }
};

const SheetUtils = {
  getSheet: function(sheetName) {
    const sheet = getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) throw new Error("Missing sheet: " + sheetName);
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
        return row.some(function(value) {
          return value !== "";
        });
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

  appendRows: function(sheetName, rows) {
    if (!rows || rows.length === 0) return;
    const sheet = this.getSheet(sheetName);
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  },

  updateStatus: function(sheetName, id, status) {
    const sheet = this.getSheet(sheetName);
    const values = sheet.getDataRange().getValues();
    const headers = values[0] || [];
    const statusColumn = headers.indexOf("status") + 1;

    if (statusColumn === 0) throw new Error("Missing status column in " + sheetName);

    for (let rowIndex = 1; rowIndex < values.length; rowIndex++) {
      if (values[rowIndex][0] === id) {
        sheet.getRange(rowIndex + 1, statusColumn).setValue(status);
        return;
      }
    }
  }
};

function json(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
