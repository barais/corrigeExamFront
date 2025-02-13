import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IScan, getScanIdentifier } from '../scan.model';

export type EntityResponseType = HttpResponse<IScan>;
export type EntityArrayResponseType = HttpResponse<IScan[]>;

@Injectable({ providedIn: 'root' })
export class ScanService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/scans');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(scan: IScan): Observable<EntityResponseType> {
    return this.http.post<IScan>(this.resourceUrl, scan, { observe: 'response' });
  }

  createWithProgress(scan: IScan): Observable<HttpEvent<IScan>> {
    return this.http.post<IScan>(this.resourceUrl, scan, { reportProgress: true, observe: 'events' });
  }

  update(scan: IScan): Observable<EntityResponseType> {
    return this.http.put<IScan>(`${this.resourceUrl}`, scan, { observe: 'response' });
  }

  updateWithProgress(scan: IScan): Observable<HttpEvent<IScan>> {
    // eslint-disable-next-line no-console
    return this.http.put<IScan>(`${this.resourceUrl}`, scan, { reportProgress: true, observe: 'events' } /* { observe: 'response' }*/);
  }

  uploadScan(file: File, scanId: number): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.applicationConfigService.getEndpointFor('api/uploadScan')}/${scanId} `, formData, {
      reportProgress: true,
      responseType: 'json',
      observe: 'events',
    });
  }

  partialUpdate(scan: IScan): Observable<EntityResponseType> {
    return this.http.patch<IScan>(`${this.resourceUrl}/${getScanIdentifier(scan) as number}`, scan, { observe: 'response' });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IScan>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IScan[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addScanToCollectionIfMissing(scanCollection: IScan[], ...scansToCheck: (IScan | null | undefined)[]): IScan[] {
    const scans: IScan[] = scansToCheck.filter(isPresent);
    if (scans.length > 0) {
      const scanCollectionIdentifiers = scanCollection.map(scanItem => getScanIdentifier(scanItem)!);
      const scansToAdd = scans.filter(scanItem => {
        const scanIdentifier = getScanIdentifier(scanItem);
        if (scanIdentifier == null || scanCollectionIdentifiers.includes(scanIdentifier)) {
          return false;
        }
        scanCollectionIdentifiers.push(scanIdentifier);
        return true;
      });
      return [...scansToAdd, ...scanCollection];
    }
    return scanCollection;
  }
}
