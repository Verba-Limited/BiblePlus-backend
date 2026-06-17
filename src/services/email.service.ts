import { resend, FROM_EMAIL } from "../config/resend";
import { User } from "../modules/auth/auth.model";

export const EmailService = {

  /* =====================================================
     WELCOME EMAIL
  ===================================================== */
  async sendWelcome(to: string, firstName: string) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "Welcome to BiblePlus 🙏",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to BiblePlus</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${firstName}! 🎉</h2>
              <p>We're so glad you've joined the BiblePlus community. Your spiritual journey starts here.</p>
              <p>Here's what you can do on BiblePlus:</p>
              <ul>
                <li>📖 Read and study the Bible</li>
                <li>🙏 Share and receive prayer requests</li>
                <li>📚 Read Christian books</li>
                <li>✍️ Read Christian blogs</li>
                <li>🎯 Take Bible quizzes</li>
                <li>📅 Attend Christian events</li>
              </ul>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  Start Your Journey
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
      console.log(`✅ Welcome email sent to ${to}`);
    } catch (error) {
      console.error("❌ Welcome email failed:", error);
    }
  },

  /* =====================================================
     PASSWORD RESET EMAIL
  ===================================================== */
  async sendPasswordReset(to: string, firstName: string, resetToken: string) {
    try {
      const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "Reset Your BiblePlus Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${firstName},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              <p>This link expires in <strong>1 hour</strong>.</p>
              <p>If you didn't request this, ignore this email — your password won't change.</p>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
      console.log(`✅ Password reset email sent to ${to}`);
    } catch (error) {
      console.error("❌ Password reset email failed:", error);
    }
  },

  /* =====================================================
     ADMIN OTP EMAIL
  ===================================================== */
  async sendAdminOtp(to: string, username: string, otp: string) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "🔒 BiblePlus Admin — Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #e74c3c; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Security Verification</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9; border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px;">
              <h2>Hello ${username},</h2>
              <p>You recently requested to perform a sensitive action (like changing your password) in the BiblePlus Admin panel.</p>
              <p>Here is your One-Time Password (OTP):</p>
              
              <div style="background: white; border: 2px dashed #e74c3c; padding: 20px; text-align: center; margin: 30px 0; border-radius: 10px;">
                <h1 style="font-size: 40px; letter-spacing: 5px; margin: 0; color: #e74c3c;">${otp}</h1>
              </div>

              <p>This code will expire in <strong>10 minutes</strong>.</p>
              <p>If you did not request this, please ignore this email and verify your account security.</p>
              
              <p style="color: #888; font-size: 12px; text-align: center; margin-top: 40px;">
                BiblePlus Security System
              </p>
            </div>
          </div>
        `
      });
      console.log(`✅ Admin OTP sent to ${to}`);
    } catch (error) {
      console.error("❌ Admin OTP email failed:", error);
    }
  },

  /* =====================================================
     VERSE OF THE DAY EMAIL
  ===================================================== */
  async sendVerseOfDay(to: string, firstName: string, verse: any) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "📖 Your Verse of the Day",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">✨ Verse of the Day</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Good morning, ${firstName}! 🌅</h2>
              <div style="background: white; border-left: 4px solid #6B4EFF; 
                          padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p style="font-size: 18px; font-style: italic; color: #333;">
                  "${verse.text}"
                </p>
                <p style="color: #6B4EFF; font-weight: bold;">— ${verse.reference}</p>
              </div>
              <p>Take a moment to meditate on this verse today. Let it guide your steps and fill your heart with peace.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  Open BiblePlus
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("❌ Verse of day email failed:", error);
    }
  },

  /* =====================================================
     NEW BLOG EMAIL
  ===================================================== */
  async sendNewBlog(to: string, firstName: string, blog: any) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `📝 New Blog: ${blog.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">New Blog Post</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${firstName}! 👋</h2>
              <p>A new blog post has been published on BiblePlus:</p>
              ${blog.coverImage ? `<img src="${blog.coverImage}" style="width: 100%; border-radius: 10px; margin: 15px 0;" />` : ""}
              <h3 style="color: #6B4EFF;">${blog.title}</h3>
              <p>${blog.summary || blog.excerpt || ""}</p>
              <p><strong>Category:</strong> ${blog.category}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/blog/${blog.slug}" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  Read Now
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("❌ New blog email failed:", error);
    }
  },

  /* =====================================================
     NEW BOOK EMAIL
  ===================================================== */
  async sendNewBook(to: string, firstName: string, book: any) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `📚 New Book: ${book.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">New Book Available</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${firstName}! 📖</h2>
              <p>A new book has been added to BiblePlus:</p>
              ${book.coverImage ? `<img src="${book.coverImage}" style="width: 200px; border-radius: 10px; margin: 15px auto; display: block;" />` : ""}
              <h3 style="color: #6B4EFF;">${book.title}</h3>
              <p><strong>Author:</strong> ${book.author}</p>
              <p><strong>Category:</strong> ${book.category}</p>
              <p>${book.description || ""}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/books/${book._id}" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  Read Now
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("❌ New book email failed:", error);
    }
  },

  /* =====================================================
     DAILY QUIZ REMINDER EMAIL
  ===================================================== */
  async sendQuizReminder(to: string, firstName: string) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "🎯 Your Daily Bible Quiz is Ready!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Daily Quiz Time! 🎯</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${firstName}! 👋</h2>
              <p>Your daily Bible quiz is ready! Test your knowledge of God's Word and earn XP points.</p>
              <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <p style="font-size: 40px; margin: 0;">🏆</p>
                <p style="font-size: 18px; font-weight: bold; color: #6B4EFF;">Can you get a perfect score today?</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/quiz" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  Take Quiz Now
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("❌ Quiz reminder email failed:", error);
    }
  },

  /* =====================================================
     PRAYER REQUEST EMAIL
  ===================================================== */
  async sendPrayerRequest(to: string, firstName: string, prayer: any, requesterName: string) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "🙏 Someone Needs Your Prayers",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Prayer Request 🙏</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${firstName},</h2>
              <p><strong>${requesterName}</strong> has shared a prayer request and needs your support:</p>
              <div style="background: white; border-left: 4px solid #6B4EFF; 
                          padding: 20px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #6B4EFF; margin-top: 0;">${prayer.title}</h3>
                <p style="color: #333;">${prayer.description}</p>
              </div>
              <p>Take a moment to pray for them. Your prayers make a difference! 💜</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/prayer" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  Pray Now
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("❌ Prayer request email failed:", error);
    }
  },

  /* =====================================================
     EVENT REMINDER EMAIL
  ===================================================== */
  async sendEventReminder(to: string, firstName: string, event: any, hoursUntil: number) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: `⏰ Reminder: ${event.title} starts in ${hoursUntil} hour${hoursUntil > 1 ? "s" : ""}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Event Reminder ⏰</h1>
            </div>
            <div style="padding: 30px; background: #f9f9f9;">
              <h2>Hello ${firstName}! 👋</h2>
              <p>Your event is coming up soon:</p>
              <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #6B4EFF; margin-top: 0;">${event.title}</h3>
                <p>⏰ Starts in <strong>${hoursUntil} hour${hoursUntil > 1 ? "s" : ""}</strong></p>
                <p>📅 ${new Date(event.startDate).toLocaleString()}</p>
                ${event.location ? `<p>📍 ${event.location}</p>` : ""}
                ${event.liveStream?.url ? `<p>🔴 <a href="${event.liveStream.url}">Join Livestream</a></p>` : ""}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.APP_URL}/events/${event._id}" 
                   style="background: #6B4EFF; color: white; padding: 15px 30px; 
                          border-radius: 25px; text-decoration: none; font-weight: bold;">
                  View Event
                </a>
              </div>
              <p style="color: #888; font-size: 12px; text-align: center;">
                God bless you 🙏 — The BiblePlus Team
              </p>
            </div>
          </div>
        `
      });
    } catch (error) {
      console.error("❌ Event reminder email failed:", error);
    }
  },

  /* =====================================================
     NEW BLOG TO ALL USERS
  ===================================================== */
  async sendNewBlogToAll(blog: any) {
    await this.sendToAllUsers(
      `📝 New Blog: ${blog.title}`,
      (firstName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Blog Post</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${firstName}! 👋</h2>
            <p>A new blog post has been published on BiblePlus:</p>
            ${blog.coverImage ? `<img src="${blog.coverImage}" style="width: 100%; border-radius: 10px; margin: 15px 0;" />` : ""}
            <h3 style="color: #6B4EFF;">${blog.title}</h3>
            <p>${blog.summary || blog.excerpt || ""}</p>
            <p><strong>Category:</strong> ${blog.category}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/blog/${blog.slug}"
                 style="background: #6B4EFF; color: white; padding: 15px 30px;
                        border-radius: 25px; text-decoration: none; font-weight: bold;">
                Read Now
              </a>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center;">
              God bless you 🙏 — The BiblePlus Team
            </p>
          </div>
        </div>
      `
    );
  },

  /* =====================================================
     NEW BOOK TO ALL USERS
  ===================================================== */
  async sendNewBookToAll(book: any) {
    await this.sendToAllUsers(
      `📚 New Book: ${book.title}`,
      (firstName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Book Available</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${firstName}! 📖</h2>
            <p>A new book has been added to BiblePlus:</p>
            ${book.coverImage ? `<img src="${book.coverImage}" style="width: 200px; border-radius: 10px; margin: 15px auto; display: block;" />` : ""}
            <h3 style="color: #6B4EFF;">${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Category:</strong> ${book.category}</p>
            <p>${book.description || ""}</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/books/${book._id}"
                 style="background: #6B4EFF; color: white; padding: 15px 30px;
                        border-radius: 25px; text-decoration: none; font-weight: bold;">
                Read Now
              </a>
            </div>
            <p style="color: #888; font-size: 12px; text-align: center;">
              God bless you 🙏 — The BiblePlus Team
            </p>
          </div>
        </div>
      `
    );
  },

  /* =====================================================
     SEND TO ALL USERS (BULK)
  ===================================================== */
  async sendToAllUsers(
    subject: string,
    buildHtml: (firstName: string) => string
  ) {
    try {
      const users = await User.find({ verified: true }).select("email firstName");

      console.log(`📧 Sending bulk email to ${users.length} users...`);

      // ✅ Send in batches of 50 to avoid rate limits
      const BATCH_SIZE = 50;
      for (let i = 0; i < users.length; i += BATCH_SIZE) {
        const batch = users.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(user =>
            resend.emails.send({
              from: FROM_EMAIL,
              to: user.email,
              subject,
              html: buildHtml(user.firstName || "Friend")
            }).catch(err => console.error(`❌ Failed to send to ${user.email}:`, err))
          )
        );

        // ✅ Small delay between batches
        if (i + BATCH_SIZE < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      console.log(`✅ Bulk email sent to ${users.length} users`);
    } catch (error) {
      console.error("❌ Bulk email failed:", error);
    }
  }
};