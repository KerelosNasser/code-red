/**
 * GOOGLE APPS SCRIPT BACKEND
 * Deployment: Deploy as Web App -> Execute as Me -> Access: Anyone
 */

const CONFIG = {
  SHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(),
  CACHE_TTL: 600, // 10 minutes
  SECRET_KEY: "YOUR_OPTIONAL_SECRET", // Recommended for POST protection
};

/**
 * ROUTER: doGet
 */
function doGet(e) {
  const action = e.parameter.action;
  
  try {
    switch (action) {
      case 'getCourses':
        return jsonResponse(CourseService.getAllWithLessons());
      case 'getProducts':
        return jsonResponse(ProductService.getAll());
      case 'getLessons':
        return jsonResponse(LessonService.getByCourse(e.parameter.course_id));
      case 'clearCache':
        if (CONFIG.SECRET_KEY && e.parameter.token !== CONFIG.SECRET_KEY) {
          return jsonResponse({ error: "Unauthorized" }, 401);
        }
        CacheService.getScriptCache().removeAll(['courses', 'products']);
        return jsonResponse({ success: true, message: "Cache cleared" });
      default:
        return jsonResponse({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

/**
 * ROUTER: doPost
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validate Secret Key if configured
    if (CONFIG.SECRET_KEY && data.token !== CONFIG.SECRET_KEY) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const action = data.action;

    switch (action) {
      case 'submitForm':
        return jsonResponse(SubmissionService.handle(data.payload));
      default:
        return jsonResponse({ error: "Invalid action" }, 400);
    }
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
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
    
    // Group lessons by course_id
    const lessonMap = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.course_id]) acc[lesson.course_id] = [];
      acc[lesson.course_id].push(lesson);
      return acc;
    }, {});

    const result = courses.map(course => ({
      ...course,
      lessons: (lessonMap[course.id] || []).sort((a, b) => a.order - b.order)
    }));

    cache.put('courses', JSON.stringify(result), CONFIG.CACHE_TTL);
    return result;
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

    const products = SheetUtils.readAll('Products');
    cache.put('products', JSON.stringify(products), CONFIG.CACHE_TTL);
    return products;
  }
};

/**
 * SERVICES: Submission (The Transactional Flow)
 */
const SubmissionService = {
  handle: function(payload) {
    const submissionId = Utilities.getUuid();
    const createdAt = new Date().toISOString();
    
    // 1. Find or Create User
    const userId = UserService.getOrCreate(payload.email, payload.name, payload.phone);
    
    // 2. Create Submission Record
    const submissionRow = [
      submissionId,
      userId,
      payload.type || "generic",
      JSON.stringify(payload),
      "PENDING",
      createdAt
    ];
    SheetUtils.appendRow('Submissions', submissionRow);
    
    // 3. Extract and Batch Insert Members
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
        SheetUtils.updateStatus('Submissions', submissionId, "SUCCESS");
      } catch (e) {
        SheetUtils.updateStatus('Submissions', submissionId, "PARTIAL_FAILURE");
        throw e;
      }
    } else {
      SheetUtils.updateStatus('Submissions', submissionId, "SUCCESS");
    }
    
    return { success: true, submissionId };
  }
};

/**
 * SERVICES: User
 */
const UserService = {
  getOrCreate: function(email, name, phone) {
    const cache = CacheService.getScriptCache();
    const cachedId = cache.get(`user_${email}`);
    if (cachedId) return cachedId;

    const users = SheetUtils.readAll('Users');
    const existing = users.find(u => u.email === email);
    
    if (existing) {
      cache.put(`user_${email}`, existing.id, CONFIG.CACHE_TTL);
      return existing.id;
    }

    const newId = Utilities.getUuid();
    SheetUtils.appendRow('Users', [newId, name, email, phone, "servant", new Date().toISOString()]);
    cache.put(`user_${email}`, newId, CONFIG.CACHE_TTL);
    return newId;
  }
};

/**
 * SERVICES: Lesson
 */
const LessonService = {
  getByCourse: function(courseId) {
    const lessons = SheetUtils.readAll('Lessons');
    return lessons.filter(l => l.course_id === courseId).sort((a, b) => a.order - b.order);
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
        sheet.getRange(i + 1, 5).setValue(status); // Column 5 is 'status'
        break;
      }
    }
  }
};

function jsonResponse(data, code = 200) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
