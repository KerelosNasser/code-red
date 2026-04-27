/**
 * DaRA (Didaskalia Advanced Robotics Association)
 * Google Apps Script Backend API
 * 
 * Rules:
 * - Each sheet = table
 * - id (UUID), created_at, status
 * - Return { success: true, data: ... }
 * - Cache GET requests
 * - Batch read/write
 * - Secret key for POST
 */

const CONFIG = {
  SECRET: "DARA-ELKEDESEEN",
  CACHE_TTL: 600, // 10 minutes
  SHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId()
};

/**
 * ROUTER: doGet
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getCourses':
        return json(CourseService.getAllWithLessons());
      case 'getProducts':
        return json(ProductService.getAll());
      case 'getLessons':
        return json(LessonService.getByCourse(e.parameter.course_id));
      case 'clearCache':
        if (e.parameter.token !== CONFIG.SECRET) return json({ success: false, error: "Unauthorized" }, 401);
        CacheService.getScriptCache().removeAll(['courses', 'products']);
        return json({ success: true, message: "Cache cleared" });
      default:
        return json({ success: false, error: "Invalid action" }, 400);
    }
  } catch (error) {
    return json({ success: false, error: error.message }, 500);
  }
}

/**
 * ROUTER: doPost
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    
    // Security check
    if (body.token !== CONFIG.SECRET) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const action = body.action;

    switch (action) {
      case 'submitForm':
        return json(SubmissionService.handle(body.payload));
      default:
        return json({ success: false, error: "Invalid action" }, 400);
    }
  } catch (error) {
    return json({ success: false, error: error.message }, 500);
  }
}

/**
 * SERVICES: Course & Lesson
 */
const CourseService = {
  getAllWithLessons: function() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('courses');
    if (cached) return JSON.parse(cached);

    const courses = SheetUtils.readAll('Courses');
    const lessons = SheetUtils.readAll('Lessons');
    
    const lessonMap = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.course_id]) acc[lesson.course_id] = [];
      acc[lesson.course_id].push({
        ...lesson,
        url: `https://drive.google.com/uc?id=${lesson.drive_file_id}`
      });
      return acc;
    }, {});

    const data = courses.map(course => ({
      ...course,
      lessons: (lessonMap[course.id] || []).sort((a, b) => a.order - b.order)
    }));

    const response = { success: true, data: data };
    cache.put('courses', JSON.stringify(response), CONFIG.CACHE_TTL);
    return response;
  }
};

/**
 * SERVICES: Product
 */
const ProductService = {
  getAll: function() {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('products');
    if (cached) return JSON.parse(cached);

    const data = SheetUtils.readAll('Products');
    const response = { success: true, data: data };
    cache.put('products', JSON.stringify(response), CONFIG.CACHE_TTL);
    return response;
  }
};

/**
 * SERVICES: Submission
 */
const SubmissionService = {
  handle: function(payload) {
    const submissionId = Utilities.getUuid();
    const createdAt = new Date();
    
    // 1. Find or Create User
    const userId = UserService.getOrCreate(payload.email, payload.name, payload.phone);
    
    // 2. Create Submission Record
    const submissionRow = [
      submissionId,
      userId,
      payload.type || "generic",
      JSON.stringify(payload),
      "pending",
      createdAt
    ];
    SheetUtils.appendRow('Submissions', submissionRow);
    
    // 3. Batch Insert Members
    if (payload.members && payload.members.length > 0) {
      try {
        const memberRows = payload.members.map(m => [
          Utilities.getUuid(),
          submissionId,
          m.name,
          m.DOB || m.dob,
          m.PhoneNumber || m.phone
        ]);
        SheetUtils.appendRows('Members', memberRows);
        SheetUtils.updateStatus('Submissions', submissionId, "completed");
      } catch (e) {
        SheetUtils.updateStatus('Submissions', submissionId, "partial_failure");
        throw e;
      }
    } else {
      SheetUtils.updateStatus('Submissions', submissionId, "completed");
    }
    
    return { success: true, data: { submissionId } };
  }
};

/**
 * SERVICES: User
 */
const UserService = {
  getOrCreate: function(email, name, phone) {
    const users = SheetUtils.readAll('Users');
    const existing = users.find(u => u.email === email);
    
    if (existing) return existing.id;

    const newId = Utilities.getUuid();
    SheetUtils.appendRow('Users', [newId, name, email, phone, "servant", new Date()]);
    return newId;
  }
};

/**
 * SERVICES: Lesson
 */
const LessonService = {
  getByCourse: function(courseId) {
    const lessons = SheetUtils.readAll('Lessons');
    const data = lessons.filter(l => l.course_id === courseId).sort((a, b) => a.order - b.order);
    return { success: true, data: data };
  }
};

/**
 * UTILS: Sheets
 */
const SheetUtils = {
  readAll: function(sheetName) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    return data.map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
  },
  appendRow: function(sheetName, row) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    sheet.appendRow(row);
  },
  appendRows: function(sheetName, rows) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length).setValues(rows);
  },
  updateStatus: function(sheetName, id, status) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        sheet.getRange(i + 1, 5).setValue(status);
        break;
      }
    }
  }
};

function json(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
