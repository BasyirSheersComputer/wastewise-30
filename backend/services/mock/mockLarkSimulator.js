/**
 * Mock Lark (WFM) Simulator
 * Simulates Lark/Feishu Workforce Management system for staff scheduling and labor optimization
 * Based on Lark API patterns for shift management and staff performance
 */

import logger from '../../utils/logger.js';

export class MockLarkSimulator {
  constructor(config = {}) {
    this.staff = config.staff || [];
    this.shifts = config.shifts || [];
    this.schedules = config.schedules || [];
  }

  /**
   * Initialize Lark integration
   */
  async initializeIntegration(credentials) {
    await this._delay(100);
    
    return {
      success: true,
      appId: credentials.appId || 'lark_mock_001',
      tenantId: credentials.tenantId || 'tenant_mock_001',
      integration: {
        status: 'active',
        syncStaff: true,
        syncSchedules: true,
        syncAttendance: true,
        syncFrequency: 'realtime'
      }
    };
  }

  /**
   * Fetch staff roster
   */
  async fetchStaffRoster(options = {}) {
    await this._delay(150);
    
    const { outletId, date } = options;
    
    // Generate realistic staff data
    const staff = this._generateStaff(outletId);
    
    return {
      success: true,
      data: staff,
      count: staff.length,
      outlet_id: outletId,
      date: date || new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Fetch staff schedules
   */
  async fetchSchedules(options = {}) {
    await this._delay(200);
    
    const { startDate, endDate, outletId, staffId } = options;
    const days = this._getDaysBetween(startDate || new Date(), endDate || this._addDays(new Date(), 7));
    
    const schedules = [];
    const staffList = staffId ? [{ id: staffId }] : this._generateStaff(outletId);
    
    days.forEach(date => {
      staffList.forEach(member => {
        // Generate shift assignments based on outlet needs
        const shiftType = this._generateShiftType(date);
        
        if (shiftType) {
          schedules.push({
            schedule_id: `SCHED_${date.toISOString().split('T')[0]}_${member.id}`,
            staff_id: member.id,
            staff_name: member.name || `Staff ${member.id}`,
            outlet_id: outletId || 'outlet_001',
            date: date.toISOString().split('T')[0],
            shift_type: shiftType.type,
            start_time: shiftType.startTime,
            end_time: shiftType.endTime,
            break_duration: shiftType.breakDuration,
            position: member.position || 'Barista',
            status: 'scheduled',
            created_at: new Date().toISOString()
          });
        }
      });
    });
    
    return {
      success: true,
      data: schedules,
      count: schedules.length,
      dateRange: { startDate, endDate }
    };
  }

  /**
   * Fetch attendance records
   */
  async fetchAttendance(options = {}) {
    await this._delay(150);
    
    const { startDate, endDate, outletId } = options;
    const days = this._getDaysBetween(startDate || this._addDays(new Date(), -7), endDate || new Date());
    
    const attendance = [];
    const staffList = this._generateStaff(outletId);
    
    days.forEach(date => {
      staffList.forEach(member => {
        const shift = this._generateShiftType(date);
        if (shift) {
          const clockIn = new Date(date);
          const [hours, minutes] = shift.startTime.split(':');
          clockIn.setHours(parseInt(hours), parseInt(minutes) + Math.floor(Math.random() * 10) - 5, 0);
          
          const clockOut = new Date(date);
          const [endHours, endMinutes] = shift.endTime.split(':');
          clockOut.setHours(parseInt(endHours), parseInt(endMinutes) + Math.floor(Math.random() * 15) - 5, 0);
          
          attendance.push({
            attendance_id: `ATT_${date.toISOString().split('T')[0]}_${member.id}`,
            staff_id: member.id,
            staff_name: member.name || `Staff ${member.id}`,
            outlet_id: outletId || 'outlet_001',
            date: date.toISOString().split('T')[0],
            shift_type: shift.type,
            scheduled_start: shift.startTime,
            scheduled_end: shift.endTime,
            clock_in: clockIn.toISOString(),
            clock_out: clockOut.toISOString(),
            hours_worked: ((clockOut - clockIn) / (1000 * 60 * 60)).toFixed(2),
            status: this._getAttendanceStatus(),
            late_minutes: Math.max(0, Math.floor(Math.random() * 10) - 3),
            created_at: new Date().toISOString()
          });
        }
      });
    });
    
    return {
      success: true,
      data: attendance,
      count: attendance.length,
      dateRange: { startDate, endDate }
    };
  }

  /**
   * Fetch staff performance metrics
   */
  async fetchStaffPerformance(staffId, options = {}) {
    await this._delay(100);
    
    const { startDate, endDate } = options;
    
    return {
      success: true,
      staff_id: staffId,
      staff_name: `Staff ${staffId}`,
      period: { startDate, endDate },
      metrics: {
        total_hours: Math.floor(Math.random() * 100) + 120, // 120-220 hours
        average_shift_duration: (Math.random() * 3 + 6).toFixed(2), // 6-9 hours
        on_time_rate: Math.random() * 0.2 + 0.8, // 80-100%
        attendance_rate: Math.random() * 0.15 + 0.85, // 85-100%
        productivity_score: Math.random() * 20 + 80, // 80-100
        customer_feedback_score: Math.random() * 1.5 + 4.0, // 4.0-5.5
        waste_variance: Math.random() * 10 - 5, // -5% to +5%
        sales_per_hour: Math.floor(Math.random() * 200) + 100 // RM 100-300/hour
      },
      last_updated: new Date().toISOString()
    };
  }

  /**
   * Update staff schedule
   */
  async updateSchedule(scheduleData) {
    await this._delay(200);
    
    return {
      success: true,
      schedule_id: scheduleData.schedule_id || `SCHED_${Date.now()}`,
      status: 'updated',
      ...scheduleData,
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Generate staff roster
   */
  _generateStaff(outletId) {
    const positions = ['Barista', 'Cashier', 'Manager', 'Barista', 'Cashier'];
    const names = ['Ahmad', 'Siti', 'Lim Wei', 'Sarah', 'Kumar', 'Nur', 'Tan', 'Chen'];
    
    return positions.map((position, idx) => ({
      id: `staff_${outletId}_${idx + 1}`,
      name: `${names[idx % names.length]} ${position}`,
      position: position,
      email: `staff${idx + 1}@outlet.com`,
      phone: `+60 1${Math.floor(Math.random() * 90000000) + 10000000}`,
      status: 'active',
      hire_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      training_level: ['basic', 'intermediate', 'advanced', 'expert'][Math.floor(Math.random() * 4)],
      outlet_id: outletId || 'outlet_001'
    }));
  }

  /**
   * Generate shift type based on date
   */
  _generateShiftType(date) {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Coffee shops have different shift patterns
    const shifts = isWeekend 
      ? [
          { type: 'morning', startTime: '07:00', endTime: '15:00', breakDuration: 30 },
          { type: 'afternoon', startTime: '14:00', endTime: '22:00', breakDuration: 30 },
          { type: 'full', startTime: '07:00', endTime: '22:00', breakDuration: 60 }
        ]
      : [
          { type: 'morning', startTime: '06:00', endTime: '14:00', breakDuration: 30 },
          { type: 'afternoon', startTime: '13:00', endTime: '21:00', breakDuration: 30 },
          { type: 'evening', startTime: '16:00', endTime: '22:00', breakDuration: 30 }
        ];
    
    // 70% chance of having a shift
    if (Math.random() > 0.3) {
      return shifts[Math.floor(Math.random() * shifts.length)];
    }
    
    return null;
  }

  /**
   * Get attendance status
   */
  _getAttendanceStatus() {
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  /**
   * Add days to date
   */
  _addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Calculate days between dates
   */
  _getDaysBetween(startDate, endDate) {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    
    return days;
  }

  /**
   * Simulate API delay
   */
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default MockLarkSimulator;

