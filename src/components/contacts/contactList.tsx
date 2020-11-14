import React from "react";
import { EE, URL_BASE } from "../..";
import "./contactList.scss";

export interface ContactListProps {}

export interface ContactListState {
  search: string;
  contacts: IContactData[];
  loading: boolean;
}

export interface IContactData {
  displayName: string;
  jid: string;
  info: string;
  shown: boolean;
  type: "contact" | "group";
}

class ContactList extends React.Component<ContactListProps, ContactListState> {
  searchRef: React.RefObject<HTMLInputElement>;

  constructor(props: ContactListProps) {
    super(props);
    this.state = {
      search: "",
      contacts: [],
      loading: true,
    };

    this.filterContacts = this.filterContacts.bind(this);
    this.searchRef = React.createRef();
    EE.on("add-jid", _ => {
      this.searchRef.current.value = "";
      this.filterContacts();
      this.searchRef.current.focus();
    }).on("remove-jid", _ => {
      this.searchRef.current.value = "";
      this.filterContacts();
      this.searchRef.current.focus();
    });
  }

  componentDidMount() {
    this.fetchData();
  }

  toggleShown(jid: string, type: IContactData["type"]) {
    const i = this.state.contacts.findIndex(con => con.jid === jid);
    const con = this.state.contacts[i];
    if (!con.shown) {
      con.shown = true;
      EE.emit("add-jid", con.jid, type);
    } else {
      con.shown = false;
      EE.emit("remove-jid", con.jid, type);
    }
    this.setState(s => {
      let cons = s.contacts;
      cons[i] = con;
      return { contacts: cons };
    });
  }

  async fetchData() {
    const r = await fetch(URL_BASE + "contacts", {
      method: "POST",
    });
    const data: IContactData[] = await r.json();

    this.setState({
      contacts: data,
      loading: false,
    });
    return data;
  }

  filterContacts() {
    this.setState({
      search: this.searchRef.current.value,
    });
  }

  render() {
    if (this.state.loading) {
      return (
        <ul className="list-group" id="contactList">
          <li className="list-group-item loading">
            <div className="d-flex align-items-center">
              <strong>Loading...</strong>
              <div className="spinner-border ml-auto"></div>
            </div>
          </li>
        </ul>
      );
    }
    const filterRegEx = new RegExp(this.state.search, "i");

    let contacts: JSX.Element[] = this.state.contacts
      .filter(con => con.displayName.match(filterRegEx))
      .sort((a, b) => a.shown ? -1 : b.shown ? 1 : 0)
      .map(con => (
        <li key={con.jid} className={"list-group-item" + (con.shown ? " active" : "")} onClick={() => this.toggleShown(con.jid, con.type)}>
          {con.displayName}{con.type === "group" && <span className="float-right small">Group</span>}
          <br />
          <p className="text-secondard small">{con.info}</p>
        </li>
      ));

    if (contacts.length === 0) {
      contacts = [
        <li key="no-matches" className="list-group-item no-hover">
          <i>No matches</i>
        </li>,
      ];
    }

    return (
      <ul className="list-group" id="contactList">
        <li className="list-group-item">
          <input type="text" className="form-control" autoFocus={true} placeholder="Search..." ref={this.searchRef} defaultValue={this.state.search} onInput={this.filterContacts} />
        </li>
        {contacts}
      </ul>
    );
  }
}

export default ContactList;
