/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable arrow-body-style */
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IQuestion, Question } from '../question.model';
import { QuestionService } from '../service/question.service';
import { IZone } from 'app/entities/zone/zone.model';
import { ZoneService } from 'app/entities/zone/service/zone.service';
import { IQuestionType } from 'app/entities/question-type/question-type.model';
import { QuestionTypeService } from 'app/entities/question-type/service/question-type.service';
import { IExam } from 'app/entities/exam/exam.model';
import { ExamService } from 'app/entities/exam/service/exam.service';
import { GradeType } from 'app/entities/enumerations/grade-type.model';

type SelectableEntity = IZone | IQuestionType | IExam;

@Component({
  selector: 'jhi-question-update',
  templateUrl: './question-update.component.html',
})
export class QuestionUpdateComponent implements OnInit {
  isSaving = false;
  gradeTypeValues = Object.keys(GradeType);
  zones: IZone[] = [];
  questiontypes: IQuestionType[] = [];
  exams: IExam[] = [];

  editForm = this.fb.group({
    id: [],
    numero: [null, [Validators.required]],
    point: [],
    step: [],
    validExpression: [],
    gradeType: [],
    zoneId: [],
    typeId: [],
    examId: [],
  });

  constructor(
    protected questionService: QuestionService,
    protected zoneService: ZoneService,
    protected questionTypeService: QuestionTypeService,
    protected examService: ExamService,
    protected activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ question }) => {
      this.updateForm(question);

      this.zoneService
        .query({ filter: 'question-is-null' })
        .pipe(
          map((res: HttpResponse<IZone[]>) => {
            return res.body || [];
          })
        )
        .subscribe((resBody: IZone[]) => {
          if (!question.zoneId) {
            this.zones = resBody;
          } else {
            this.zoneService
              .find(question.zoneId)
              .pipe(
                map((subRes: HttpResponse<IZone>) => {
                  return subRes.body ? [subRes.body].concat(resBody) : resBody;
                })
              )
              .subscribe((concatRes: IZone[]) => (this.zones = concatRes));
          }
        });

      this.questionTypeService.query().subscribe((res: HttpResponse<IQuestionType[]>) => (this.questiontypes = res.body || []));

      this.examService.query().subscribe((res: HttpResponse<IExam[]>) => (this.exams = res.body || []));
    });
  }

  updateForm(question: IQuestion): void {
    this.editForm.patchValue({
      id: question.id,
      numero: question.numero,
      point: question.point,
      step: question.step,
      validExpression: question.validExpression,
      gradeType: question.gradeType,
      zoneId: question.zoneId,
      typeId: question.typeId,
      examId: question.examId,
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const question = this.createFromForm();
    if (question.id !== undefined) {
      this.subscribeToSaveResponse(this.questionService.update(question));
    } else {
      this.subscribeToSaveResponse(this.questionService.create(question));
    }
  }

  private createFromForm(): IQuestion {
    return {
      ...new Question(),
      id: this.editForm.get(['id'])!.value,
      numero: this.editForm.get(['numero'])!.value,
      point: this.editForm.get(['point'])!.value,
      step: this.editForm.get(['step'])!.value,
      validExpression: this.editForm.get(['validExpression'])!.value,
      gradeType: this.editForm.get(['gradeType'])!.value,
      zoneId: this.editForm.get(['zoneId'])!.value,
      typeId: this.editForm.get(['typeId'])!.value,
      examId: this.editForm.get(['examId'])!.value,
    };
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IQuestion>>): void {
    result.subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.isSaving = false;
    this.previousState();
  }

  protected onSaveError(): void {
    this.isSaving = false;
  }

  trackById(index: number, item: SelectableEntity): any {
    return item.id;
  }
}
