import axios from 'axios';

export type ReportType = 'loans' | 'savings' | 'patronage' | 'comprehensive';
export type ExportFormat = 'pdf' | 'csv';

interface ReportOptions {
  type: ReportType;
  format: ExportFormat;
  start_date?: string;
  end_date?: string;
}

interface ReportData {
  id: number;
  member_id: number;
  report_type: ReportType;
  format: ExportFormat;
  file_path: string;
  file_size: number;
  generated_at: string;
  expires_at: string;
}

class ReportService {
  private baseUrl = '/api/member';

  /**
   * Generate a report and return download URL
   */
  async generateReport(options: ReportOptions): Promise<{
    success: boolean;
    download_url?: string;
    file_name?: string;
    message: string;
  }> {
    try {
      const response = await axios.post<{
        download_url: string;
        file_name: string;
      }>(`${this.baseUrl}/reports/generate`, options);

      return {
        success: true,
        download_url: response.data.download_url,
        file_name: response.data.file_name,
        message: 'Report generated successfully',
      };
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to generate report',
      };
    }
  }

  /**
   * Generate and download loan report
   */
  async downloadLoanReport(
    format: ExportFormat,
    options?: { start_date?: string; end_date?: string }
  ): Promise<void> {
    try {
      const result = await this.generateReport({
        type: 'loans',
        format,
        ...options,
      });

      if (result.success && result.download_url) {
        this.triggerDownload(result.download_url, result.file_name);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Failed to download loan report:', error);
      throw error;
    }
  }

  /**
   * Generate and download savings report
   */
  async downloadSavingsReport(
    format: ExportFormat,
    options?: { start_date?: string; end_date?: string }
  ): Promise<void> {
    try {
      const result = await this.generateReport({
        type: 'savings',
        format,
        ...options,
      });

      if (result.success && result.download_url) {
        this.triggerDownload(result.download_url, result.file_name);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Failed to download savings report:', error);
      throw error;
    }
  }

  /**
   * Generate and download patronage report
   */
  async downloadPatronageReport(
    format: ExportFormat,
    options?: { start_date?: string; end_date?: string }
  ): Promise<void> {
    try {
      const result = await this.generateReport({
        type: 'patronage',
        format,
        ...options,
      });

      if (result.success && result.download_url) {
        this.triggerDownload(result.download_url, result.file_name);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Failed to download patronage report:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive report (all data)
   */
  async downloadComprehensiveReport(
    format: ExportFormat,
    options?: { start_date?: string; end_date?: string }
  ): Promise<void> {
    try {
      const result = await this.generateReport({
        type: 'comprehensive',
        format,
        ...options,
      });

      if (result.success && result.download_url) {
        this.triggerDownload(result.download_url, result.file_name);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Failed to download comprehensive report:', error);
      throw error;
    }
  }

  /**
   * Get recently generated reports
   */
  async getRecentReports(limit: number = 5): Promise<ReportData[]> {
    try {
      const response = await axios.get<{ data: ReportData[] }>(
        `${this.baseUrl}/reports?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch recent reports:', error);
      return [];
    }
  }

  /**
   * Delete a generated report
   */
  async deleteReport(reportId: number): Promise<{ success: boolean; message: string }> {
    try {
      await axios.delete(`${this.baseUrl}/reports/${reportId}`);
      return {
        success: true,
        message: 'Report deleted successfully',
      };
    } catch (error: any) {
      console.error(`Failed to delete report ${reportId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete report',
      };
    }
  }

  /**
   * Get report generation history
   */
  async getReportHistory(
    filters?: { type?: ReportType; start_date?: string; end_date?: string }
  ): Promise<ReportData[]> {
    try {
      const response = await axios.get<{ data: ReportData[] }>(
        `${this.baseUrl}/reports/history`,
        {
          params: filters,
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch report history:', error);
      return [];
    }
  }

  /**
   * Helper method to trigger download
   */
  private triggerDownload(url: string, fileName?: string): void {
    const link = document.createElement('a');
    link.href = url;
    if (fileName) {
      link.download = fileName;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get report format options
   */
  getFormatOptions(): Array<{ format: ExportFormat; label: string; icon: string }> {
    return [
      {
        format: 'pdf',
        label: 'PDF',
        icon: 'FileText',
      },
      {
        format: 'csv',
        label: 'CSV',
        icon: 'Table',
      },
    ];
  }

  /**
   * Get report type options
   */
  getReportTypeOptions(): Array<{ type: ReportType; label: string; description: string }> {
    return [
      {
        type: 'loans',
        label: 'Loan Report',
        description: 'Loan details, amortization, and payment history',
      },
      {
        type: 'savings',
        label: 'Savings Report',
        description: 'Savings balance and transaction history',
      },
      {
        type: 'patronage',
        label: 'Patronage Report',
        description: 'Patronage refund history and amounts',
      },
      {
        type: 'comprehensive',
        label: 'Comprehensive Report',
        description: 'All information combined into one report',
      },
    ];
  }
}

export default new ReportService();
