import { Response } from "express";

import {
  AuthRequest,
} from "../../middleware/auth.middleware";

import * as leadService from "../../services/lead/lead.service";

/* ============================
   CREATE LEAD
============================ */
export const createLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const result =
      await leadService.createLead(
        req.body,
        req.employee
      );

    res
      .status(201)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,

        message:
          error.message ||
          "Lead Creation Failed",
      });
  }
};

/* ============================
   GET ALL LEADS
============================ */

export const getLeads = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const result =
      await leadService.getLeads(
        req.query,
        req.employee
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(500)
      .json({
        success: false,
        message:
          error.message ||
          "Failed to Fetch Leads",
      });
  }
};

/* ============================
   GET LEAD BY ID
============================ */

export const getLeadById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const result =
      await leadService.getLeadById(
        req.params.id as string,
        req.employee
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(404)
      .json({
        success: false,
        message:
          error.message ||
          "Lead Not Found",
      });
  }
};

/* ============================
   UPDATE LEAD
============================ */

export const updateLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const id =
      req.params.id as string;

    const result =
      await leadService.updateLead(
        id,
        req.body,
        req.employee
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message ||
          "Lead Update Failed",
      });
  }
};

/* ============================
   ASSIGN LEAD
============================ */

export const assignLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const leadId =
      req.params.id as string;

    const result =
      await leadService.assignLead(
        leadId,
        req.body,
        req.employee
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message ||
          "Lead Assignment Failed",
      });
  }
};

/* ============================
   CHANGE LEAD STATUS
============================ */
export const changeLeadStage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message: "Authenticated Employee Not Found",
      });

      return;
    }

    const { id } = req.params;

    const result =
      await leadService.changeLeadStage(
        id as string,
    req.employee.id,
    req.body,
    req.employee
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Lead Stage Update Failed",
    });
  }
};

/* ============================
   CREATE FOLLOW-UP
============================ */

export const createFollowUp = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const leadId =
      req.params.id as string;

    const result =
      await leadService.createFollowUp(
         leadId,
    req.employee.id,
    req.body,
    req.employee
      );

    res
      .status(201)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message ||
          "Follow-up Creation Failed",
      });
  }
};

/* ============================
   GET ALL FOLLOW-UPS
============================ */

export const getFollowUps = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const result =
      await leadService.getFollowUps(
        {
          page:
            req.query.page
              ? Number(
                  req.query.page
                )
              : 1,

          limit:
            req.query.limit
              ? Number(
                  req.query.limit
                )
              : 10,

          search:
            typeof req.query
              .search ===
            "string"
              ? req.query.search
              : undefined,

          employeeId:
            typeof req.query
              .employeeId ===
            "string"
              ? req.query
                  .employeeId
              : undefined,

          isCompleted:
            typeof req.query
              .isCompleted ===
            "string"
              ? req.query
                  .isCompleted
              : undefined,

          view:
            typeof req.query
              .view ===
            "string"
              ? (req.query
                  .view as
                  | "TODAY"
                  | "OVERDUE"
                  | "UPCOMING")
              : undefined,
        },
        req.employee
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* ============================
   COMPLETE FOLLOW-UP
============================ */

export const completeFollowUp = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const result =
      await leadService.completeFollowUp(
        req.params.id as string,
        req.employee
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* ============================
   SAVE CALL OUTCOME
============================ */

export const saveCallOutcome = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message:
          "Authenticated Employee Not Found",
      });

      return;
    }

    const { id } =
      req.params;

    const result =
      await leadService.saveCallOutcome(
         id as string,
        req.employee.id,
        req.body,
        req.employee
      );

    res
      .status(200)
      .json(result);
  } catch (error: any) {
    res
      .status(400)
      .json({
        success: false,
        message:
          error.message,
      });
  }
};

/* ============================
   DAILY CALLING SUMMARY
============================ */

export const getDailyCallingSummary =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.employee
      ) {
        res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authenticated Employee Not Found",
          });

        return;
      }

      const roleName =
        typeof req.employee
          .role ===
        "string"
          ? req.employee
              .role
          : req.employee
              .role?.name;

      /*
       * Employee can only request
       * their own summary.
       */

      const employeeId =
        roleName ===
        "EMPLOYEE"
          ? req.employee.id
          : typeof req.query
                .employeeId ===
              "string"
            ? req.query
                .employeeId
            : req.employee.id;

      const result =
        await leadService.getDailyCallingSummary(
          employeeId,
          req.employee
        );

      res
        .status(200)
        .json(
          result
        );
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed To Load Calling Summary",
        });
    }
  };

/* ============================
   LEAD TIMELINE
============================ */

export const getLeadTimeline =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const { id } =
        req.params;

      const result =
        await leadService.getLeadTimeline(
          id as string,
          req.employee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };
/* ============================
   GET LEAD PIPELINE
============================ */

export const getLeadPipeline =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const roleName =
        req.employee.role
          ?.name;

      /*
       * Employee cannot manipulate
       * employeeId query parameter.
       */
      const employeeId =
        roleName ===
        "EMPLOYEE"
          ? req.employee.id
          : typeof req.query
                .employeeId ===
              "string"
            ? req.query
                .employeeId
            : undefined;

      const search =
        typeof req.query
          .search ===
        "string"
          ? req.query.search
          : undefined;

      const result =
        await leadService.getLeadPipeline(
          employeeId,
          search,
          req.employee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };

/* ============================
   CHANGE LEAD STAGE
============================ */

export const changeLeadStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.employee) {
      res.status(401).json({
        success: false,
        message: "Authenticated Employee Not Found",
      });
      return;
    }

    const leadId =
      req.params.id as string;

    const result =
      await leadService.changeLeadStatus(
        leadId,
        req.employee.id,
        req.body,
        req.employee
      );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message:
        error.message ||
        "Lead Status Update Failed",
    });
  }
};
/* ============================
   BULK ASSIGN
============================ */

export const bulkAssignLeads =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const result =
        await leadService.bulkAssignLeads(
          req.body,
          req.employee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message ||
            "Bulk Lead Assignment Failed",
        });
    }
  };

/* ============================
   ALLOCATE LEADS FROM POOL
============================ */

export const allocateLeadsFromPool =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const result =
        await leadService.allocateLeadsFromPool(
          req.body,
          req.employee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message ||
            "Lead Pool Allocation Failed",
        });
    }
  };

/* ============================
   BULK CHANGE STAGE
============================ */

export const bulkChangeLeadStage =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const result =
        await leadService.bulkChangeLeadStage(
          req.body,
  req.employee.id,
  req.employee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };

/* ============================
   BULK CHANGE STATUS
============================ */

export const bulkChangeLeadStatus =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const result =
        await leadService.bulkChangeLeadStatus(
          req.body,
  req.employee.id,
  req.employee
        );

      res
        .status(200)
        .json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message:
            error.message,
        });
    }
  };

  /* ============================
   CALLING QUEUE
============================ */

export const getCallingQueue =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.employee) {
        res.status(401).json({
          success: false,
          message:
            "Authenticated Employee Not Found",
        });

        return;
      }

      const page =
        req.query.page
          ? Number(
              req.query.page
            )
          : 1;

      const limit =
        req.query.limit
          ? Number(
              req.query.limit
            )
          : 20;

      const search =
        typeof req.query
          .search ===
        "string"
          ? req.query.search
          : undefined;

      const employeeId =
        typeof req.query
          .employeeId ===
        "string"
          ? req.query
              .employeeId
          : undefined;

      const result =
        await leadService.getCallingQueue(
          {
            page,
            limit,
            search,
            employeeId,
          },
          req.employee
        );

      res
        .status(200)
        .json(result);
    } catch (
      error: any
    ) {
      res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Failed To Load Calling Queue",
        });
    }
  };

  /* ============================
   LEAD SUMMARY
============================ */

export const getLeadSummary =
  async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (
        !req.employee
      ) {
        res
          .status(401)
          .json({
            success:
              false,

            message:
              "Authenticated Employee Not Found",
          });

        return;
      }

      const result =
        await leadService.getLeadSummary(
          req.employee
        );

      res
        .status(200)
        .json(
          result
        );
    } catch (
      error: any
    ) {
      res
        .status(500)
        .json({
          success:
            false,

          message:
            error.message ||
            "Failed To Load Lead Summary",
        });
    }
  };