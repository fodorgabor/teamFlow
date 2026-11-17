import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { User } from "../../models/user.model";
import { API_BASE_URL } from "./api-config";
import { UserService } from "./user-service";

describe("UserService", () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("list should send GET to the users endpoint", () => {
    const users: User[] = [
      { id: 1, name: "Kiss Anna", email: "anna@example.com", role: "Fejlesztő", active: true },
    ];

    service.list().subscribe(result => expect(result).toEqual(users));
    const request = httpTestingController.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.method).toBe("GET");
    request.flush(users);
  });

  it("create should POST user data without an id", () => {
    const data = {
      name: "Tóth Éva",
      email: "eva@example.com",
      role: "Tervező",
      active: true,
    };
    const response: User = { id: 3, ...data };

    service.create(data).subscribe(result => expect(result).toEqual(response));
    const request = httpTestingController.expectOne(`${API_BASE_URL}/users`);
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual(data);
    expect(request.request.body).not.toHaveProperty("id");
    request.flush(response);
  });

  it("update should PATCH the user endpoint with the supplied data", () => {
    const data = { role: "Vezető", active: false };
    const response: User = {
      id: 2,
      name: "Nagy Bence",
      email: "bence@example.com",
      ...data,
    };

    service.update(2, data).subscribe(result => expect(result).toEqual(response));
    const request = httpTestingController.expectOne(`${API_BASE_URL}/users/2`);
    expect(request.request.method).toBe("PATCH");
    expect(request.request.body).toEqual(data);
    request.flush(response);
  });

  it("remove should DELETE the user endpoint", () => {
    service.remove(4).subscribe(result => expect(result).toBeUndefined());
    const request = httpTestingController.expectOne(`${API_BASE_URL}/users/4`);
    expect(request.request.method).toBe("DELETE");
    request.flush(null);
  });
});
