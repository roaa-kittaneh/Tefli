require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
const { startVaccinationReminderJob } = require('./cron/vaccinationReminder');

const PORT = process.env.PORT || 5000;

// ==========================================================================
// Database Connection + Server Startup
// ==========================================================================

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Sync models in development (use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      // Use { alter: true } carefully — only adds/changes columns, doesn't drop
      // In production, always use migrations via sequelize-cli
      await sequelize.sync({ alter: false });
      console.log('✅ Sequelize models synchronized.');
    }

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    });

    // Start daily vaccination reminder cron job
    startVaccinationReminderJob();

    // ==========================================================================
    // Graceful Shutdown Handlers
    // ==========================================================================

    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          console.log('✅ Database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error during shutdown:', err.message);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
      // Optionally exit — in production you may want to log and continue
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err.message);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
