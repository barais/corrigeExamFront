/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UntypedFormBuilder } from '@angular/forms';
import { PreferenceService } from './preference.service';

@Component({
  selector: 'jhi-preference-page',
  templateUrl: './preference-page.component.html',
  styleUrls: ['./preference-page.component.scss'],
})
export class PreferencePageComponent implements OnInit {
  editForm = this.fb.group({
    qcm_min_width_shape: [],
    qcm_min_height_shape: [],
    qcm_epsilon: [],
    qcm_differences_avec_case_blanche: [],
    linelength: [],
    repairsize: [],
    dilatesize: [],
    morphsize: [],
    drawcontoursizeh: [],
    drawcontoursizev: [],
    minCircle: [],
    maxCircle: [],
    numberofpointToMatch: [],
    numberofgoodpointToMatch: [],
    defaultAlignAlgowithMarker: [true],
  });
  /*
http://angular-form-builder.surge.sh/

{
        "qcm_min_width_shape": 10,
      "qcm_min_height_shape" : 10,
      "qcm_epsilon" : 0.0145, // 0.03
      "qcm_differences_avec_case_blanche":0.22,
  "linelength" : 15,
  "repairsize" : 3,
   "dilatesize" : 3,
   "morphsize" : 3,
   "drawcontoursizeh" : 4,
   "drawcontoursizev" : 4,
   "minCircle": 6,
   "maxCircle": 20,
   "numberofpointToMatch": 5,
   "numberofgoodpointToMatch": 0,
   "defaultAlignAlgowithMarker" : true
}
*/

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    public preferenceService: PreferenceService,
    private fb: UntypedFormBuilder
  ) {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {
    this.editForm.patchValue(this.preferenceService.getPreference());
  }

  clearToDefault(): void {
    this.editForm.patchValue(this.preferenceService.clearToDefault());
  }

  onSubmit(formValues: any): void {
    this.preferenceService.save(formValues);
    this.ref.close();
  }
}
