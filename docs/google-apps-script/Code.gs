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
  Sections: ["id", "course_id", "title", "order"],
  Lessons: ["id", "course_id", "section_id", "title", "description", "drive_file_id", "resource_url", "order"],
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
      case "getUserAssets":
        if (parameters.token !== CONFIG.SECRET) {
          return json({ success: false, error: "Unauthorized" });
        }
        return json(UserService.getUserAssets(parameters.email, parameters.phone));
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
    const sections = SheetUtils.readAll("Sections");
    const lessons = SheetUtils.readAll("Lessons");

    // Group sections by course
    const sectionMap = sections.reduce(function(acc, section) {
      if (!acc[section.course_id]) acc[section.course_id] = [];
      acc[section.course_id].push({
        ...section,
        lessons: []
      });
      return acc;
    }, {});

    // Sort sections by order
    Object.keys(sectionMap).forEach(function(courseId) {
      sectionMap[courseId].sort(function(a, b) {
        return Number(a.order || 0) - Number(b.order || 0);
      });
    });

    // Group lessons by section (and track course_id if section_id is missing)
    lessons.forEach(function(lesson) {
      const driveId = lesson.drive_file_id;
      const lessonData = {
        ...lesson,
        url: "https://drive.google.com/uc?id=" + driveId,
        preview_url: "https://drive.google.com/file/d/" + driveId + "/view"
      };

      if (lesson.section_id) {
        // Find section across all courses (or optimize by course if needed)
        const courseSections = sectionMap[lesson.course_id] || [];
        const section = courseSections.find(function(s) { return s.id === lesson.section_id; });
        if (section) {
          section.lessons.push(lessonData);
        }
      }
    });

    // Sort lessons in each section
    Object.keys(sectionMap).forEach(function(courseId) {
      sectionMap[courseId].forEach(function(section) {
        section.lessons.sort(function(a, b) {
          return Number(a.order || 0) - Number(b.order || 0);
        });
      });
    });

    const data = courses.map(function(course) {
      return {
        ...course,
        sections: sectionMap[course.id] || []
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
    const inputPhone = String(phone || "").replace(/\D/g, '').replace(/^0+/, '');
    
    // 1. Check if the phone belongs to a member first
    const members = SheetUtils.readAll("Members");
    const memberRecord = members.find(function(m) {
      const recordPhone = String(m.phone || "").replace(/\D/g, '').replace(/^0+/, '');
      return recordPhone === inputPhone && recordPhone.length > 5;
    });

    if (memberRecord) {
      const submissions = SheetUtils.readAll("Submissions");
      const teamSubmission = submissions.find(function(s) {
        return s.id === memberRecord.submission_id;
      });

      if (teamSubmission) {
        let teamName = "Team";
        try {
          const payload = JSON.parse(teamSubmission.payload);
          teamName = payload.teamName || teamName;
        } catch (e) {}

        return {
          success: true,
          data: {
            hasAccess: true,
            teamName: teamName,
            submission: teamSubmission,
            role: "member"
          }
        };
      }
    }

    // 2. Check if the phone belongs to a servant (User)
    const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
    const users = SheetUtils.readAll("Users");
    const user = users.find(function(record) {
      const recordPhone = String(record.phone || "").replace(/\D/g, '').replace(/^0+/, '');
      const phoneMatches = recordPhone === inputPhone && recordPhone.length > 5;
      
      if (normalizedEmail) {
        const emailMatches = String(record.email || "").trim().toLowerCase() === normalizedEmail;
        return emailMatches && phoneMatches;
      }
      
      return phoneMatches;
    });

    if (!user) {
      return { success: true, data: { hasAccess: false } };
    }

    const submissions = SheetUtils.readAll("Submissions");
    const latestSubmission = submissions
      .filter(function(submission) {
        return submission.user_id === user.id;
      })
      .sort(function(a, b) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })[0];

    let teamName = "Team";
    if (latestSubmission) {
      try {
        const payload = JSON.parse(latestSubmission.payload);
        teamName = payload.teamName || teamName;
      } catch (e) {}
    }

    return {
      success: true,
      data: {
        hasAccess: true,
        user: user,
        teamName: teamName,
        submission: latestSubmission || { id: user.id },
        role: "servant"
      }
    };
  },

  getUserAssets: function(email, phone) {
    const access = this.checkAccess(email, phone);
    if (!access.success || !access.data.hasAccess) {
      return { success: true, data: [] };
    }

    // Asset access is tied to the team's submission ID
    const submissionId = access.data.submission.id;
    const submissions = SheetUtils.readAll("Submissions");
    
    // Find all successful purchases for this submission (team)
    // We treat the submission ID as the "team ID" for asset ownership
    const teamPurchases = submissions.filter(function(s) {
      return (s.id === submissionId || s.user_id === access.data.user?.id) && 
             s.type === "purchase" && 
             s.status === "completed";
    });

    const productIds = [];
    teamPurchases.forEach(function(p) {
      try {
        const payload = JSON.parse(p.payload);
        if (payload.productIds && Array.isArray(payload.productIds)) {
          payload.productIds.forEach(function(id) {
            if (productIds.indexOf(id) === -1) productIds.push(id);
          });
        }
      } catch (e) {}
    });

    if (productIds.length === 0) {
      return { success: true, data: [] };
    }

    const allProducts = SheetUtils.readAll("Products");
    const userProducts = allProducts.filter(function(p) {
      return productIds.indexOf(String(p.id)) !== -1;
    });

    return { success: true, data: userProducts };
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
