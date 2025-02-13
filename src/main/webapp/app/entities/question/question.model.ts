import { ITextComment } from 'app/entities/text-comment/text-comment.model';
import { IGradedComment } from 'app/entities/graded-comment/graded-comment.model';
import { GradeType } from 'app/entities/enumerations/grade-type.model';

export interface IQuestion {
  id?: number;
  numero?: number;
  point?: number;
  step?: number | null;
  validExpression?: string | null;
  gradeType?: GradeType | null;
  textcomments?: ITextComment[] | null;
  gradedcomments?: IGradedComment[] | null;
  zoneId?: number;
  typeAlgoName?: string;
  typeId?: number;
  examName?: string;
  examId?: number;
}

export class Question implements IQuestion {
  constructor(
    public id?: number,
    public numero?: number,
    public point?: number,
    public step?: number | null,
    public validExpression?: string | null,
    public gradeType?: GradeType | null,
    public textcomments?: ITextComment[] | null,
    public gradedcomments?: IGradedComment[] | null,
    public zoneId?: number,
    public typeAlgoName?: string,
    public typeId?: number,
    public examName?: string,
    public examId?: number
  ) {}
}
export function getQuestionIdentifier(question: IQuestion): number | undefined {
  return question.id;
}
