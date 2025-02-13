/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
import { Component, OnInit } from '@angular/core';
// import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faCircle as farCircle } from '@fortawesome/free-regular-svg-icons';
import { faMotorcycle as fasMotorcycle } from '@fortawesome/free-solid-svg-icons';
import { faGraduationCap as faGraduationCap } from '@fortawesome/free-solid-svg-icons';
import { faBookOpenReader as faBookOpenReader } from '@fortawesome/free-solid-svg-icons';
import { CourseService } from '../../entities/course/service/course.service';
import { ICourse } from '../../entities/course/course.model';
import { IExam } from '../../entities/exam/exam.model';
import { ExamService } from '../../entities/exam/service/exam.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ExamSheetService } from '../../entities/exam-sheet/service/exam-sheet.service';
import { StudentService } from '../../entities/student/service/student.service';
import { IStudent } from 'app/entities/student/student.model';
import { db } from '../db/db';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { AccountService } from '../../core/auth/account.service';
import { MessageService } from 'primeng/api';
import { CacheDownloadNotification, CacheUploadNotification, CacheUploadService } from './cacheUpload.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'jhi-exam-detail',
  templateUrl: './exam-detail.component.html',
  styleUrls: ['./exam-detail.component.scss'],
  providers: [ConfirmationService, MessageService],
})
export class ExamDetailComponent implements OnInit, CacheUploadNotification, CacheDownloadNotification {
  blocked = false;
  farCircle = farCircle as IconProp;
  fasMotorcycle = fasMotorcycle as IconProp;
  faGraduationCap = faGraduationCap as IconProp;
  faBookOpenReader = faBookOpenReader as IconProp;
  examId = '';
  exam: IExam | undefined;
  course: ICourse | undefined;
  dockItems!: any[];
  showAssociation = false;
  showCorrection = false;
  nbreFeuilleParCopie = 0;
  numberPagesInScan = 0;
  students: IStudent[] | undefined;
  message = '';
  submessage = '';
  progress = 0;

  constructor(
    public courseService: CourseService,
    public examService: ExamService,
    protected activatedRoute: ActivatedRoute,
    public confirmationService: ConfirmationService,
    public examSheetService: ExamSheetService,
    public studentService: StudentService,
    public router: Router,
    public appConfig: ApplicationConfigService,
    public accountService: AccountService,
    private messageService: MessageService,
    public cacheUploadService: CacheUploadService,
    private translateService: TranslateService
  ) {}
  setShowAssociation(v: boolean): void {
    this.showAssociation = v;
  }
  setShowCorrection(v: boolean): void {
    this.showCorrection = v;
  }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      if (params.get('examid') !== null) {
        this.blocked = true;
        this.examId = params.get('examid')!;
        this.examService.find(+this.examId).subscribe(ex => {
          this.exam = ex.body!;

          this.courseService.find(this.exam.courseId!).subscribe(
            e => (this.course = e.body!),
            () => {
              this.router.navigateByUrl('/');
            }
          );

          //          this.examSheetService.

          db.exams
            .where('id')
            .equals(+this.examId)
            .count()
            .then(c => {
              if (c !== 0) {
                this.blocked = true;
                this.showAssociation = true;
                this.initTemplate();
              } else {
                this.cacheUploadService.importCache(+this.examId, this.translateService, this.messageService, this);
              }
            });
        });

        this.translateService.get('scanexam.removeexam').subscribe(() => {
          this.initCmpt();
        });
        this.translateService.onLangChange.subscribe(() => {
          this.initCmpt();
        });
      }
    });
  }

  initCmpt(): void {
    this.dockItems = [
      {
        label: this.translateService.instant('scanexam.gobacktomodule'),
        icon: this.appConfig.getFrontUrl() + 'content/images/left-arrow.svg',
        title: this.translateService.instant('scanexam.gobacktomoduledetail'),
        command1: () => {
          this.gobacktomodule();
        },
      },
      {
        label: this.translateService.instant('scanexam.removeexam'),
        icon: this.appConfig.getFrontUrl() + 'content/images/remove-rubbish.svg',
        title: this.translateService.instant('scanexam.removeexamdetail'),
        command1: () => {
          this.confirmeDelete();
        },
      },
      {
        label: this.translateService.instant('scanexam.cleancache'),
        icon: this.appConfig.getFrontUrl() + 'content/images/Font_Awesome_5_solid_eraser.svg',
        title: this.translateService.instant('scanexam.cleancachedetail'),
        command1: () => {
          this.confirmeCleanCache();
        },
      },

      {
        label: this.translateService.instant('scanexam.synchrobrowserserver'),
        icon: this.appConfig.getFrontUrl() + 'content/images/upload-solid.svg',
        title: this.translateService.instant('scanexam.synchrobrowserserverdetail'),
        command1: () => {
          this.confirmUpload();
        },
      },
      {
        label: this.translateService.instant('scanexam.synchroserverbrowser'),
        icon: this.appConfig.getFrontUrl() + 'content/images/download-solid.svg',
        title: this.translateService.instant('scanexam.synchroserverbrowserdetail'),
        command1: () => {
          this.confirmDownload();
        },
      },
    ];
  }

  initTemplate(): void {
    db.templates
      .where('examId')
      .equals(+this.examId)
      .count()
      .then(e2 => {
        this.nbreFeuilleParCopie = e2;
        // Step 2 Query Scan in local DB

        db.alignImages
          .where('examId')
          .equals(+this.examId)
          .count()
          .then(e1 => {
            this.numberPagesInScan = e1;

            this.studentService.query({ courseId: this.exam!.courseId }).subscribe(
              studentsbody => {
                this.blocked = false;

                this.students = studentsbody.body!;
                const ex2 = (this.students.map(s => s.examSheets) as any)
                  .flat()
                  .filter((ex1: any) => ex1.scanId === this.exam!.scanfileId && ex1.pagemin !== -1).length;
                this.showCorrection = ex2 === this.numberPagesInScan / this.nbreFeuilleParCopie;
              },
              () => {
                this.blocked = false;
              }
            );
          });
      });
  }

  confirmeDelete(): any {
    this.translateService.get('scanexam.removexamveverify').subscribe(data => {
      this.confirmationService.confirm({
        message: data,
        accept: () => {
          this.examService.delete(this.exam!.id!).subscribe(() => {
            db.removeElementForExam(+this.examId)
              .then(() => {
                this.router.navigateByUrl('/course/' + this.course!.id);
              })
              .catch(() => {
                this.messageService.add({
                  severity: 'error',
                  summary: this.translateService.instant('scanexam.deletecacheko'),
                  detail: this.translateService.instant('scanexam.deletecachekodetail'),
                });
                this.router.navigateByUrl('/course/' + this.course!.id);
              });
          });
        },
      });
    });
  }

  confirmeCleanCache(): any {
    this.translateService.get('scanexam.confirmcleancache').subscribe(data => {
      this.confirmationService.confirm({
        message: data,
        // eslint-disable-next-line object-shorthand
        accept: () => {
          db.removeElementForExam(+this.examId).then(() => {
            this.showAssociation = false;
            this.showCorrection = false;
          });
        },
      });
    });
  }

  confirmUpload(): any {
    this.translateService.get('scanexam.confirmuploadcache').subscribe(data => {
      this.confirmationService.confirm({
        message: data,
        // eslint-disable-next-line object-shorthand
        accept: () => {
          this.cacheUploadService.exportCache(+this.examId, this.translateService, this.messageService, this.numberPagesInScan, this);
        },
      });
    });
  }
  setMessage(v: string): void {
    this.message = v;
  }
  setSubMessage(v: string): void {
    this.submessage = v;
  }
  setBlocked(v: boolean): void {
    this.blocked = v;
  }
  setProgress(v: number): void {
    this.progress = v;
  }

  confirmDownload(): any {
    this.translateService.get('scanexam.confirmuploadcache').subscribe(data1 => {
      this.confirmationService.confirm({
        message: data1,
        // eslint-disable-next-line object-shorthand
        accept: () => {
          this.blocked = true;
          this.cacheUploadService.importCache(+this.examId, this.translateService, this.messageService, this);
        },
      });
    });
  }

  hasCache(): boolean {
    return true;
  }

  couldAnswer(): boolean {
    return true;
  }

  gobacktomodule(): void {
    if (this.course !== undefined) {
      this.router.navigateByUrl('/course/' + this.course.id);
    }
  }
}
