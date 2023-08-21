import {Component, ViewChild} from '@angular/core';
import {ContactRequest} from "../../../model/contact-request/contact-request";
import {ContactRequestService} from "../../../services/contact-request.service";
import {ToastrService} from "ngx-toastr";
import {LoadingComponent} from "../../utils/loading/loading.component";

@Component({
  selector: 'app-contact-requests',
  templateUrl: './contact-requests.component.html',
  styleUrls: ['./contact-requests.component.css']
})
export class ContactRequestsComponent {

  displayStyle = "none";
  errorText: string = "";

  @ViewChild(LoadingComponent)
  loadingComponent!: LoadingComponent;

  contactRequests: ContactRequest[] = [];

  constructor(private contactRequestService: ContactRequestService, private toastr: ToastrService) {
  }

  handleRequest(requestId: number, accepted: boolean) {
    this.errorText = '';
    this.loadingComponent.start();

    this.contactRequestService.handleRequest(requestId, accepted).subscribe({
      complete: () => {
        this.removeContactRequest(requestId);
      },
      error: (error) => {
        this.loadingComponent.stop();
        this.errorText = error.message;
      },
      next: () => {
        this.loadingComponent.stop();
        if(accepted) {
          this.toastr.info("Contact request accepted.");
        }
        else {
          this.toastr.info("Contact request rejected.");
        }
      }
    });
  }

  private removeContactRequest(requestId: number) {
    let requestIndex = this.contactRequests.findIndex(r => r.requestId === requestId);

    if(requestIndex !== -1) {
      this.contactRequests.splice(requestIndex, 1);
    }

    if(this.contactRequests.length == 0) {
      this.close();
    }
  }

  open(requests: ContactRequest[]) {
    this.contactRequests = requests;
    this.displayStyle = "block";
  }

  close(){
    this.displayStyle = "none";
  }
}
